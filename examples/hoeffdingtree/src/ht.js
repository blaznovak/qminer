// import analytics module
var analytics = require('analytics.js');
var assert = require('assert.js');

function testClassificationContAttr() {
   // algorithm parameters 
   var htParams = {
      "gracePeriod": 300,
      "splitConfidence": 1e-6,
      "tieBreaking": 0.005,
      "driftCheck": 1000,
      "windowSize": 100000,
      "conceptDriftP": false
   };
   
   // describe the data stream 
   var seaCfg = {
      "dataFormat": ["A1", "A2", "A3", "C"], 
      "A1": {
         "type": "numeric",
      }, 
      "A2": {
         "type": "numeric",
      }, 
      "A3": {
         "type": "numeric"
      }, 
      "C": {
         "type": "discrete",
         "values": ["0", "1"]
      }
   };

   // create a new learner 
   var ht = analytics.newHoeffdingTree(seaCfg, htParams);

   // train the model
   var streamData = fs.openRead("./sandbox/ht/sea.dat");
   var examplesN = 0;
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(",");
      // get discrete attributes
      var example_discrete = [];
      // get numeric attributes
      var example_numeric = line.slice(0, 3);
      example_numeric = example_numeric.map(parseFloat);
      // get target
      var target = line[3];
      if (++examplesN % 10000 == 0) {
         console.say("Processing example number " + examplesN);
      }
      // if (examplesN >= 200000) { break; } // 200k examples 
      // update the model
      ht.process(example_discrete, example_numeric, target);
   }
   // Note that this is not how you'd test a streaming classifier in practice 
   // This is just playing around 
   console.say("Now testing the model");
   streamData = fs.openRead("./sandbox/ht/sea.dat");
   examplesN = 0;
   var correct = 0;
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(",");
      // get discrete attributes
      var example_discrete = [];
      // get numeric attributes
      var example_numeric = line.slice(0, 3);
      example_numeric = example_numeric.map(parseFloat);
      // get target
      var target = line[3];
      if (++examplesN % 10000 == 0) {
         console.say("Testing on example number " + examplesN);
      }
      // if (examplesN >= 200000) { break; } // 200k examples 
      // update the model
      if (parseFloat(ht.classify(example_discrete, example_numeric)) == target) {
         ++correct;
      }
   }
   console.say("ACC = " + (correct/examplesN));
   // use the model 
   var label = ht.classify([], [6.677259,5.152133,2.982455]);
   console.say("f(6.677259,5.152133,2.982455) = " + label);
   var label = ht.classify([], [1.848014,0.041624,2.913719]);
   console.say("f(1.848014,0.041624,2.913719) = " + label);
   
   console.say("Now exporting the model as 'sea.gv'.");
   
   // export the model 
   ht.exportModel({ "file": "./sandbox/ht/sea.gv", "type": "DOT" });
}

function testClassification() {
   console.say("Testing on a titanic dataset");
   // algorithm parameters 
   var htParams = {
      "gracePeriod": 300,
      "splitConfidence": 1e-6,
      "tieBreaking": 0.005,
      "driftCheck": 1000,
      "windowSize": 15000,
      "conceptDriftP": false
   };
   
   // describe the data stream 
   var titanicCfg = {
      "dataFormat": ["status", "age", "sex", "survived"], 
      "sex": {
         "type": "discrete",
         "values": ["male", "female"]
      }, 
      "status": {
         "type": "discrete",
         "values": ["first", "second", "third", "crew"]
      }, 
      "age": {
         "type": "discrete",
         "values": ["child", "adult"]
      }, 
      "survived": {
         "type": "discrete",
         "values": ["yes", "no"]
      }
   };
   
   // create a new learner 
   var ht = analytics.newHoeffdingTree(titanicCfg, htParams);

   // train the model
   var streamData = fs.openRead("./sandbox/ht/titanic-4M.dat");
   var examplesN = 0;
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(","); // male,first,adult,yes
      // get discrete attributes
      var example_discrete = line.slice(0, 3);
      // get numeric attributes
      var example_numeric = [];
      // get target
      var target = line[3];
      if (++examplesN % 10000 == 0) {
         console.say("Processing example number " + examplesN);
      }
      if (examplesN > 500000) { break; }
      // update the model
      ht.process(example_discrete, example_numeric, target);
   }
   
   // use the model 
   var label = ht.classify(["first", "adult", "female"], []);
   console.say("Were high society women likely to survive? " + label);
   label = ht.classify(["first", "adult", "male"], []);
   console.say("Were high society men likely to survive? " + label);
   label = ht.classify(["third", "adult", "male"], []);
   console.say("Were 3rd class men likely to survive? " + label);
   label = ht.classify(["second", "adult", "female"], []);
   console.say("Were 3rd class women likely to survive? " + label);0
   console.say("Now exporting the model as 'titanic.gv'.");
   
   // This is not what you'd do in practice. We do it here just to see
   // whether we can learn simple stuff. 
   streamData = fs.openRead("./sandbox/ht/titanic-4M.dat");
   examplesN = 0;
   var correct = 0;
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(","); // male,first,adult,yes
      // get discrete attributes
      var example_discrete = line.slice(0, 3);
      // get numeric attributes
      var example_numeric = [];
      // get target
      var target = line[3];
      if (++examplesN % 10000 == 0) {
         console.say("Processing example number " + examplesN);
      }
      if (examplesN > 500000) { break; }
      // update the model
      label = ht.classify(example_discrete, example_numeric, target);
      if (label == line[line.length-1]) { ++correct; }
   }
   console.say("ACC="+(correct/examplesN));
   
   // export the model 
   ht.exportModel({ "file": "./sandbox/ht/titanic.gv", "type": "DOT" });
}

function testRegressionDisAttr() {
   // algorithm parameters 
   var htParams = {
      "gracePeriod": 300,
      "splitConfidence": 1e-6,
      "tieBreaking": 0.005,
      "driftCheck": 1000,
      "windowSize": 100000,
      "conceptDriftP": false
   };
   
   // describe the data stream 
   var regTestCfg = {
      "dataFormat": ["A", "B", "Y"],
      "A": {
         "type": "discrete",
         "values": ["t", "f"]
      },
      "B": {
         "type": "discrete",
         "values": ["t", "f"]
      },
      "Y": {
         "type": "numeric"
      }
   };
   
   // create a new learner 
   var ht = analytics.newHoeffdingTree(regTestCfg, htParams);

   // train the model
   var examplesN = 0;
   var streamData = fs.openRead("./sandbox/ht/regression-test.dat");
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(",");
      // get discrete attributes
      var example_discrete = line.slice(0, 2);
      // get numeric attributes
      var example_numeric = [];
      // get target
      var target = parseFloat(line[2]);
      // entertain the user in case we have too many learning examples 
      if (++examplesN % 10000 == 0) {
         console.say("Number of examples processed so far: "+examplesN);
         if (examplesN > 200000) { break; }
      }
      // update the model
      ht.process(example_discrete, example_numeric, target);
   }
   
   // use the model 
   var val = ht.predict(["t", "t"], []);
   console.say("f(t,t) = " + val);
   var val = ht.predict(["t", "f"], []);
   console.say("f(t,f) = " + val);
   var val = ht.predict(["f", "t"], []);
   console.say("f(f,t) = " + val);
   var val = ht.predict(["f", "f"], []);
   console.say("f(f,f) = " + val);
   
   // export the model 
   ht.exportModel({ "file": "./sandbox/ht/regression-test.gv", "type": "DOT" });
}

function testRegressionContAttr() {
   var htParams = {
      "gracePeriod": 200,
      "splitConfidence": 0.01,
      "tieBreaking": 0.05,
      "driftCheck": 1000,
      "windowSize": 100000,
      "conceptDriftP": false
   };
   
   var regTestCfg = {
      "dataFormat": ["A", "B", "Y"],
      "A": {
         "type": "discrete",
         "values": ["0", "1"]
      },
      "B": {
         "type": "numeric",
      },
      "Y": {
         "type": "numeric"
      }
   };
   
   // create a new learner 
   var ht = analytics.newHoeffdingTree(regTestCfg, htParams);

   // train the model
   var examplesN = 0;
   var streamData = fs.openRead("./sandbox/ht/reg-cont.dat");
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(",");
      // get discrete attributes
      var example_discrete = line.slice(0, 1);
      // get numeric attributes
      var example_numeric = line.slice(1, 2);
      example_numeric[0] = parseFloat(example_numeric[0]);
      // get target
      var target = parseFloat(line[2]);
      // entertain the user in case we have too many learning examples 
      if (++examplesN % 10000 == 0) {
         console.say("Number of examples processed so far: "+examplesN);
         if (examplesN > 200000) { break; }
      }
      // update the model
      ht.process(example_discrete, example_numeric, target);
   }
   
   // use the model 
   var val = ht.predict(["0"], [3.3]);
   console.say("f(0, 3.3) = " + val);
   val = ht.predict(["1"], [3.3]);
   console.say("f(1, 3.3) = " + val);
   val = ht.predict(["0"], [2.3]);
   console.say("f(0, 2.3) = " + val);
   val = ht.predict(["1"], [2.3]);
   console.say("f(1, 2.3) = " + val);
   
   // export the model 
   ht.exportModel({ "file": "./sandbox/ht/reg-cont.gv", "type": "DOT" });
}

function testRegression() {
   // algorithm parameters 
   var htParams = {
      "gracePeriod": 300,
      "splitConfidence": 1e-6,
      "tieBreaking": 0.005,
      "driftCheck": 1000,
      "windowSize": 100000,
      "conceptDriftP": false
   };
   
   // describe the data stream 
   var regTestCfg = {
      "dataFormat": [
         "year", "month", "day", "RTP", "VAL", "ROS", "KIL",
         "SHA", "BIR", "DUB", "CLA", "MUL", "CLO", "BEL", "MAL"
      ],
      "year": { "type": "numeric" },
      "month": {
         "type": "discrete",
         "values": [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
         ]
      },
      "day": {
         "type": "discrete",
         "values": [
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
            "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
            "24", "25", "26", "27", "28", "29", "30", "31"
         ]
      },
      "RTP": { "type": "numeric" },
      "VAL": { "type": "numeric" },
      "ROS": { "type": "numeric" },
      "KIL": { "type": "numeric" },
      "SHA": { "type": "numeric" },
      "BIR": { "type": "numeric" },
      "DUB": { "type": "numeric" },
      "CLA": { "type": "numeric" },
      "MUL": { "type": "numeric" },
      "CLO": { "type": "numeric" },
      "BEL": { "type": "numeric" },
      "MAL": { "type": "numeric" }
   };
   
   var ht = analytics.newHoeffdingTree(regTestCfg, htParams);
   var examplesN = 0, N = 0;
   var streamData = fs.openRead("./sandbox/ht/wind.dat");
   var err = 0.0;
   while (!streamData.eof) {
      var line = streamData.getNextLn().split(",");
      // get discrete attributes
      var example_discrete = line.slice(1, 3);
      // get numeric attributes
      var example_numeric = line.slice(0, 1);
      
      example_numeric = example_numeric.concat(line.slice(3));
      for (var i = 0; i < example_numeric.length; ++i) {
         example_numeric[i] = parseFloat(example_numeric[i]);
      }
      
      var target = parseFloat(line[line.length-1]);
      ht.process(example_discrete, example_numeric, target);
   }
   
   // export the model 
   ht.exportModel({ "file": "./sandbox/ht/wind.gv", "type": "DOT" });
}

// console.say(" --- Example using classification HoeffdingTree --- ");
// console.say("First classification scenario using bootstrapped SEA dataset");
// testClassificationContAttr();
// console.say("Second classification secnario using bootstrapped TITANIC dataset");
// testClassification();
// console.say(" --- Example using regression HoeffdingTree --- ");
// console.say("Regression scenario with discrete attributes");
// testRegressionDisAttr();
// console.say("Regression scenario with numeric attributes");
// testRegressionContAttr();
console.say("Regression scenario using WIND dataset.");
testRegression();

console.say("Interactive mode: empty line to release (press ENTER).");
console.start();

