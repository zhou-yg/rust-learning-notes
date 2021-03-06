const tf = require('@tensorflow/tfjs-node');

function linearFunc(size) {
  const k = 5;
  const b = 5;

  const fx = (x) => x * k + b + Math.random() * 2;

  let i = 0;
  const x = [];
  const y = [];
  while (i < size) {
    const smallX = Math.random();
    x.push(smallX);
    y.push(fx(smallX));
    // x.push(i);
    // y.push(fx(i));
    i++;
  }

  return {
    x,
    y,
  };
}


function getModel() {

  const model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [1],
    units: 1,
    useBias: true,
  }));
  model.add(tf.layers.dense({
    units: 1,
    useBias: true,
  }));


  // Choose an optimizer, loss function and accuracy metric,
  // then compile and return the model
  const optimizer = tf.train.sgd(5e-2);
  model.compile({
    optimizer: optimizer,
    // loss: 'meanAbsoluteError',
    loss: 'meanSquaredError',
    // loss,
  });

  return model;
}

async function train(model) {

  const trainSize = 100;
  const BATCH_SIZE = Math.floor(trainSize/10);

  const [trainXs, trainYs] = tf.tidy(() => {
    const { x, y } = linearFunc(trainSize);

    return [
      tf.tensor1d(x),
      tf.tensor1d(y),
    ];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const { x, y } = linearFunc(trainSize / 10);

    return [
      tf.tensor1d(x),
      tf.tensor1d(y),
    ];
  });

  trainXs.print();
  trainYs.print();
  testXs.print();
  testYs.print();

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 20,
    callbacks: {
      onTrainBegin (...args) {
        console.log('[fit callbacks] onTrainBegin', args);
      },
    },
  });
}


function doPrediction(model, x) {
  const testX = tf.tensor([x]);

  const preds = model.predict(testX);

  console.log('----- check doPrediction -------');
  preds.print();
}

async function run () {
  const model = getModel();
  await train(model);

  doPrediction(model, 1);
  doPrediction(model, 2);
}

run();