require('dotenv').config();
const { connect } = require('../db');
const mongoose = require('mongoose');

const User = require('../models/user');
const Group = require('../models/group');
const { Incident } = require('../models/incident');
const KnowledgeBase = require('../models/knowledgeBase');
const KnowledgeArticle = require('../models/knowledgeArticle');
const Catalog = require('../models/catalog');
const CatalogItem = require('../models/catalogItem');

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in env');
    process.exit(1);
  }

  await connect(process.env.MONGODB_URI);

  console.log('Clearing collections (users, groups, incidents, kb, catalogs)...');
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Incident.deleteMany({}),
    KnowledgeBase.deleteMany({}),
    KnowledgeArticle.deleteMany({}),
    Catalog.deleteMany({}),
    CatalogItem.deleteMany({})
  ]);

  console.log('Creating users...');
  const users = await User.create([
    { name: 'Alice Admin', email: 'alice@example.com', role: 'admin' },
    { name: 'Ben Agent', email: 'ben@example.com', role: 'agent' },
    { name: 'Kim KM', email: 'kim.km@example.com', role: 'knowledge_manager' },
    { name: 'Eve User', email: 'eve@example.com', role: 'end_user' }
  ]);

  console.log('Creating assignment groups...');
  const groups = await Group.create([
    { name: 'Network Team', description: 'Handles network incidents' },
    { name: 'Apps Team', description: 'Handles application incidents' }
  ]);

  console.log('Creating knowledge bases and articles...');
  const bases = await KnowledgeBase.create([
    { name: 'General IT', description: 'General IT how-to and troubleshooting', createdBy: users[0]._id },
    { name: 'Onboarding', description: 'Onboarding guides and requests', createdBy: users[0]._id }
  ]);

  const articles = await KnowledgeArticle.create([
    {
      title: 'How to connect to VPN',
      shortDescription: 'Steps to connect to the corporate VPN',
      description: '1) Install VPN client\n2) Enter credentials\n3) Complete MFA\n4) Contact NetOps if still failing',
      category: 'Network',
      knowledgeBase: bases[0]._id,
      owner: users[1]._id,
      validFrom: new Date(),
      published: true,
      tags: ['vpn', 'network', 'connect']
    },
    {
      title: 'New starter laptop checklist',
      shortDescription: 'Checklist for issuing a laptop to a new starter',
      description: 'Image machine, install standard apps, join domain, record asset tag.',
      category: 'Onboarding',
      knowledgeBase: bases[1]._id,
      owner: users[2]._id,
      validFrom: new Date(),
      published: true,
      tags: ['onboarding', 'laptop']
    },
    {
      title: 'Resetting your password',
      shortDescription: 'Self-service password reset steps',
      description: 'Use the SSO portal -> Forgot password -> follow email link. Contact Helpdesk if MFA issues.',
      category: 'Accounts',
      knowledgeBase: bases[0]._id,
      owner: users[1]._id,
      validFrom: new Date(),
      published: true,
      tags: ['password', 'sso']
    }
  ]);

  console.log('Creating catalogs and catalog items...');
  const catalogs = await Catalog.create([
    { name: 'Hardware', description: 'Hardware requests and inventory', createdBy: users[0]._id },
    { name: 'Software', description: 'Software install and license requests', createdBy: users[0]._id },
    { name: 'Services', description: 'Common IT services', createdBy: users[0]._id }
  ]);

  await CatalogItem.create([
    {
      title: 'New Laptop (Standard)',
      shortDescription: 'Order a standard new starter laptop',
      description: 'Intel i5, 8GB RAM, 256GB SSD, company image preinstalled.',
      category: 'Laptop',
      catalog: catalogs[0]._id,
      knowledgeArticle: articles.find(a => a.title.includes('laptop'))?._id || null,
      available: true
    },
    {
      title: 'Docking Station',
      shortDescription: 'Order a USB-C docking station',
      description: 'Universal docking station for supported laptops.',
      category: 'Peripherals',
      catalog: catalogs[0]._id,
      knowledgeArticle: null,
      available: true
    },
    {
      title: 'Office Suite License',
      shortDescription: 'Request Office productivity license',
      description: 'Includes Word, Excel, PowerPoint and Outlook license assignment.',
      category: 'Software',
      catalog: catalogs[1]._id,
      knowledgeArticle: null,
      available: true
    },
    {
      title: 'Jira Project Access',
      shortDescription: 'Request contributor access to a Jira project',
      description: 'Provide project key and reason; approvals may be required.',
      category: 'Service',
      catalog: catalogs[2]._id,
      knowledgeArticle: articles.find(a => a.title.includes('password'))?._id || null,
      available: true
    }
  ]);

  console.log('Creating sample incidents and requests...');
  await Incident.create([
    {
      shortDescription: 'Unable to reach VPN',
      description: 'User cannot authenticate to VPN service',
      priority: 'P2',
      state: 'New',
      assignmentGroup: groups[0]._id,
      assignedTo: users[1]._id,
      caller: users[3]._id,
      openedBy: users[3]._id,
      impact: 2,
      urgency: 1,
      ticketType: 'incident'
    },
    {
      shortDescription: 'Application error on login',
      description: '500 error on login endpoint',
      priority: 'P3',
      state: 'In Progress',
      assignmentGroup: groups[1]._id,
      assignedTo: users[1]._id,
      caller: users[3]._id,
      openedBy: users[3]._id,
      impact: 3,
      urgency: 3,
      ticketType: 'incident'
    },
    {
      shortDescription: 'Request new laptop for new starter',
      description: 'Please provide a laptop for employee John Doe',
      priority: 'P4',
      state: 'New',
      assignmentGroup: groups[1]._id,
      caller: users[3]._id,
      openedBy: users[3]._id,
      ticketType: 'request'
    }
  ]);

  console.log('✅ Seed finished');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed complete, exiting');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
