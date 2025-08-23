// ...existing code...
require('dotenv').config();
const { connect } = require('../db');
const User = require('../models/user');
const Group = require('../models/group');
const { Incident } = require('../models/incident');

async function seedDatabase() {
  await connect(process.env.MONGODB_URI);

  // clear collections (safe for dev/demo)
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Incident.deleteMany({})
  ]);

  // create users
  const users = await User.create([
    { name: 'Alice Admin', email: 'alice@example.com', role: 'admin' },
    { name: 'Ben Agent', email: 'ben@example.com', role: 'agent' },
    { name: 'Eve User', email: 'eve@example.com', role: 'end_user' }
  ]);

  // create groups
  const groups = await Group.create([
    { name: 'Network Team', description: 'Handles network incidents' },
    { name: 'Apps Team', description: 'Handles application incidents' }
  ]);

  // create sample incidents
  await Incident.create([
    {
      shortDescription: 'Unable to reach VPN',
      description: 'User cannot authenticate to VPN service',
      priority: 'P2',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id,
      ticketType: 'incident'
    },
    {
      shortDescription: 'Application error on login',
      description: '500 error on login endpoint',
      priority: 'P3',
      state: 'In Progress',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id,
      ticketType: 'incident'
    },
    // sample request tickets
    {
      shortDescription: 'Request new laptop',
      description: 'Employee onboarding - needs a laptop',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[1]._id,
      caller: users[2]._id,
      ticketType: 'request'
    },
    {
      shortDescription: 'Request access to Jira project',
      description: 'User needs contributor access for project X',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[1]._id,
      caller: users[2]._id,
      ticketType: 'request'
    }
  ]);

  console.log('✅ Seed data created');
}

// allow both programmatic use and CLI
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seedDatabase;
/* require('dotenv').config();
const { connect } = require('../db');
const User = require('../models/user');
const Group = require('../models/group');
const { Incident } = require('../models/incident');

async function run() {
  await connect(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Incident.deleteMany({})
  ]);

  const [alice, bob, carol] = await User.insertMany([
    { name: 'Alice Agent', email: 'alice@example.com', role: 'agent' },
    { name: 'Bob Enduser', email: 'bob@example.com', role: 'end_user' },
    { name: 'Carol Admin', email: 'carol@example.com', role: 'admin' }
  ]);

  const [svcDesk, netOps] = await Group.insertMany([
    { name: 'Service Desk', description: 'Frontline support' },
    { name: 'Network Ops', description: 'Network issues' }
  ]);

  await Incident.insertMany([
    {
      shortDescription: 'Email not syncing on mobile',
      description: 'User reports mobile app no longer syncs new emails',
      priority: 'P3',
      state: 'New',
      assignmentGroup: svcDesk._id,
      assignedTo: alice._id,
      caller: bob._id
    },
    {
      shortDescription: 'Office Wi-Fi intermittent',
      description: 'Multiple users report drops in Building A',
      priority: 'P2',
      state: 'In Progress',
      assignmentGroup: netOps._id,
      assignedTo: alice._id,
      caller: bob._id
    }
  ]);

  console.log('✅ Seed complete');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); }); */
