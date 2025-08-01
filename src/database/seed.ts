#!/usr/bin/env bun

import { db } from '@/config/database';
import { generateId, generateShortId } from '@/utils/crypto';
import { slugify } from '@/utils/slugify';

/**
 * Database Seeding for Development
 * 
 * Creates sample data for testing the collaborative writing app
 */

export async function runSeeding(): Promise<void> {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clear existing data in development
    await clearExistingData();
    
    // Create sample workshops
    const workshops = await createSampleWorkshops();
    
    // Create sample writing groups (templates)
    const writingGroups = await createSampleWritingGroups();
    
    // Create sample participants
    const participants = await createSampleParticipants();
    
    // Create workshop group instances
    const workshopGroups = await createSampleWorkshopGroups(workshops, writingGroups);
    
    // Add participants to groups
    await addParticipantsToGroups(workshopGroups, participants);
    
    // Create sample activities
    await createSampleActivities(workshopGroups);
    
    console.log('✅ Database seeding completed successfully');
    console.log(`📊 Created:`);
    console.log(`   - ${workshops.length} workshops`);
    console.log(`   - ${writingGroups.length} writing group templates`);
    console.log(`   - ${participants.length} participants`);
    console.log(`   - ${workshopGroups.length} workshop group instances`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function clearExistingData(): Promise<void> {
  console.log('🧹 Clearing existing development data...');
  
  // Clear in reverse dependency order
  db.exec('DELETE FROM activity_turns');
  db.exec('DELETE FROM activity_participants');
  db.exec('DELETE FROM documents');
  db.exec('DELETE FROM activities');
  db.exec('DELETE FROM online_sessions');
  db.exec('DELETE FROM group_participants');
  db.exec('DELETE FROM workshop_groups');
  db.exec('DELETE FROM participants');
  db.exec('DELETE FROM writing_groups');
  db.exec('DELETE FROM workshops');
}

async function createSampleWorkshops(): Promise<Array<{ id: string; name: string; slug: string }>> {
  console.log('📝 Creating sample workshops...');
  
  const workshops = [
    { name: 'Frühling 2025', description: 'Kreatives Schreiben im Frühjahr 2025' },
    { name: 'Sommer 2024', description: 'Sommerwerkstatt für Geschichten' },
    { name: 'Winter & Geschichten', description: 'Winterliche Schreibwerkstatt' }
  ];
  
  const insertWorkshop = db.prepare(`
    INSERT INTO workshops (id, name, description, slug, status)
    VALUES (?, ?, ?, ?, 'active')
  `);
  
  const createdWorkshops = workshops.map(workshop => {
    const id = generateId();
    const slug = slugify(workshop.name);
    
    insertWorkshop.run(id, workshop.name, workshop.description, slug);
    
    return { id, name: workshop.name, slug };
  });
  
  return createdWorkshops;
}

async function createSampleWritingGroups(): Promise<Array<{ id: string; name: string; slug: string }>> {
  console.log('✍️ Creating sample writing groups...');
  
  const groups = [
    { 
      name: 'Zusammen schreiben', 
      description: 'Gemeinsames Schreiben an einer Geschichte',
      is_template: true
    },
    { 
      name: 'Schöne Lieder', 
      description: 'Liedtexte und Gedichte schreiben',
      is_template: true
    },
    { 
      name: 'Sonettenmaschine', 
      description: 'Sonette und strukturierte Gedichte',
      is_template: true
    },
    { 
      name: 'Hörspiele', 
      description: 'Hörspielskripts und Dialoge entwickeln',
      is_template: true
    },
    { 
      name: 'Schöne Hörspiele im Winter & danach', 
      description: 'Ausführliche Hörspielwerkstatt',
      is_template: false
    }
  ];
  
  const insertGroup = db.prepare(`
    INSERT INTO writing_groups (id, name, description, slug, is_template)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const createdGroups = groups.map(group => {
    const id = generateId();
    const slug = slugify(group.name);
    
    insertGroup.run(id, group.name, group.description, slug, group.is_template);
    
    return { id, name: group.name, slug };
  });
  
  return createdGroups;
}

async function createSampleParticipants(): Promise<Array<{ id: string; display_name: string }>> {
  console.log('👥 Creating sample participants...');
  
  const participants = [
    { full_name: 'Nils Olsson', display_name: 'Nils' },
    { full_name: 'Lisa Müller', display_name: 'Lisa' },
    { full_name: 'Laura Schmidt', display_name: 'Laura' },
    { full_name: 'Jonas Weber', display_name: 'Jonas' },
    { full_name: 'Rebekka Fischer', display_name: 'Rebekka' },
    { full_name: 'Edna Brown', display_name: 'Edna' },
    { full_name: 'Richard Meyer', display_name: 'Richard' },
    { full_name: 'Samira Hassan', display_name: 'Samira' }
  ];
  
  const insertParticipant = db.prepare(`
    INSERT INTO participants (id, full_name, display_name)
    VALUES (?, ?, ?)
  `);
  
  const createdParticipants = participants.map(participant => {
    const id = generateId();
    
    insertParticipant.run(id, participant.full_name, participant.display_name);
    
    return { id, display_name: participant.display_name };
  });
  
  return createdParticipants;
}

async function createSampleWorkshopGroups(
  workshops: Array<{ id: string; name: string; slug: string }>,
  writingGroups: Array<{ id: string; name: string; slug: string }>
): Promise<Array<{ id: string; workshop_id: string; writing_group_id: string; short_id: string }>> {
  console.log('🔗 Creating workshop group instances...');
  
  const insertWorkshopGroup = db.prepare(`
    INSERT INTO workshop_groups (id, workshop_id, writing_group_id, short_id, status)
    VALUES (?, ?, ?, ?, 'active')
  `);
  
  const workshopGroups = [];
  
  // Create some group instances
  const instances = [
    { workshop: workshops[0], group: writingGroups[0] }, // Frühling 2025 + Zusammen schreiben
    { workshop: workshops[0], group: writingGroups[3] }, // Frühling 2025 + Hörspiele
    { workshop: workshops[1], group: writingGroups[1] }, // Sommer 2024 + Schöne Lieder
    { workshop: workshops[1], group: writingGroups[2] }, // Sommer 2024 + Sonettenmaschine
  ];
  
  for (const instance of instances) {
    const id = generateId();
    const shortId = generateShortId();
    
    insertWorkshopGroup.run(id, instance.workshop.id, instance.group.id, shortId);
    
    workshopGroups.push({
      id,
      workshop_id: instance.workshop.id,
      writing_group_id: instance.group.id,
      short_id: shortId
    });
  }
  
  return workshopGroups;
}

async function addParticipantsToGroups(
  workshopGroups: Array<{ id: string; workshop_id: string; writing_group_id: string; short_id: string }>,
  participants: Array<{ id: string; display_name: string }>
): Promise<void> {
  console.log('👥 Adding participants to groups...');
  
  const insertGroupParticipant = db.prepare(`
    INSERT INTO group_participants (id, workshop_group_id, participant_id, role, table_position)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Add participants to first group (Frühling 2025 + Zusammen schreiben)
  const firstGroup = workshopGroups[0];
  const groupParticipants = participants.slice(0, 5); // First 5 participants
  
  groupParticipants.forEach((participant, index) => {
    const id = generateId();
    const role = index === 0 ? 'teamer' : 'participant'; // First person is teamer
    
    insertGroupParticipant.run(id, firstGroup.id, participant.id, role, index + 1);
  });
  
  // Add participants to second group (Frühling 2025 + Hörspiele)
  const secondGroup = workshopGroups[1];
  const secondGroupParticipants = participants.slice(3, 7); // Participants 4-7 (overlap with first group)
  
  secondGroupParticipants.forEach((participant, index) => {
    const id = generateId();
    const role = index === 0 ? 'teamer' : 'participant';
    
    insertGroupParticipant.run(id, secondGroup.id, participant.id, role, index + 1);
  });
}

async function createSampleActivities(
  workshopGroups: Array<{ id: string; workshop_id: string; writing_group_id: string; short_id: string }>
): Promise<void> {
  console.log('🎯 Creating sample activities...');
  
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, workshop_group_id, name, type, config, status, position)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Add activities to first group
  const firstGroup = workshopGroups[0];
  
  const activities = [
    {
      name: 'Ideensammlung',
      type: 'collaborative_pad',
      config: JSON.stringify({ editable_by: 'teamer_only' }),
      status: 'completed',
      position: 1
    },
    {
      name: 'Bunte Zettel ziehen',
      type: 'paper_drawing',
      config: JSON.stringify({ colors: ['red', 'blue', 'green', 'yellow'], random_draw: true }),
      status: 'completed',
      position: 2
    },
    {
      name: 'Individuelle Geschichten',
      type: 'individual_pad',
      config: JSON.stringify({ time_limit: 30 }),
      status: 'active',
      position: 3
    },
    {
      name: 'Mashup zu zweit',
      type: 'mashup_writing',
      config: JSON.stringify({ pairs: true, combine_stories: true }),
      status: 'setup',
      position: 4
    }
  ];
  
  activities.forEach(activity => {
    const id = generateId();
    insertActivity.run(
      id, 
      firstGroup.id, 
      activity.name, 
      activity.type, 
      activity.config, 
      activity.status, 
      activity.position
    );
  });
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  await runSeeding();
  console.log('✨ Database seeding complete');
  process.exit(0);
}