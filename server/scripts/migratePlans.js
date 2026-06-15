require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ucpian';

async function migrate() {
  await mongoose.connect(MONGODB_URI);

  const proResult = await User.updateMany({ plan: 'Pro' }, { $set: { plan: 'Ultra' } });
  const basicResult = await User.updateMany({ plan: 'Basic' }, { $set: { plan: 'Pro' } });
  const freeResult = await User.updateMany({ plan: 'Free' }, { $set: { plan: 'Basic' } });

  console.log('Migrated Pro -> Ultra:', proResult.modifiedCount);
  console.log('Migrated Basic -> Pro:', basicResult.modifiedCount);
  console.log('Migrated Free -> Basic:', freeResult.modifiedCount);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
