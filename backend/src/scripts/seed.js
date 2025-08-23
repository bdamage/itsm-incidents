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
      caller: users[2]._id
    },
    {
      shortDescription: 'Application error on login',
      description: '500 error on login endpoint',
      priority: 'P3',
      state: 'In Progress',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Printer not working',
      description: 'Office printer is offline and not responding',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Slow internet connection',
      description: 'Users report slow internet speeds in the office',
      priority: 'P3',
      state: 'In Progress',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Software installation request',
      description: 'Request to install Adobe Photoshop on workstation',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Email delivery failure',
      description: 'Emails sent to external domains are bouncing',
      priority: 'P2',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Account locked out',
      description: 'User unable to login due to account lockout',
      priority: 'P1',
      state: 'New',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Laptop battery issue',
      description: 'Laptop battery drains quickly',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Access to shared drive',
      description: 'User requests access to shared network drive',
      priority: 'P3',
      state: 'In Progress',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Antivirus alert',
      description: 'Antivirus detected malware on workstation',
      priority: 'P1',
      state: 'New',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Monitor flickering',
      description: 'Monitor intermittently flickers and turns off',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
    },
    {
      shortDescription: 'Password reset request',
      description: 'User forgot password and needs reset',
      priority: 'P2',
      state: 'New',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[2]._id
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
// ...existing code...
// ...existing code...

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
