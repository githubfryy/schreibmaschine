Looking at your Schreibmaschine app and the specific requirements for creative writing workshops, let me analyze the **unified Loro CRDT approach vs. differentiated editors** question:

## **Recommendation: Unified Loro CRDT for All Writing**

I strongly recommend using **Loro CRDT for all writing scenarios** in your app. Here's my analysis:

## **Pros of Unified Loro CRDT Approach**

### **1. Architectural Simplicity**
```typescript
// Single document interface for all scenarios
interface WritingDocument {
  loroDocId: string
  type: 'individual' | 'collaborative' | 'rhyme_paper'
  isPublished: boolean
  participants: ParticipantRole[]
}

// Same API for all writing types
const doc = createLoroDocument(type, participants)
const markdownContent = doc.exportMarkdown()
```

**Benefits:**
- **One codebase** to maintain and debug
- **Consistent user experience** across all activities
- **Single learning curve** for participants

### **2. Seamless Transition Between Modes**
In your workshops, writing often evolves:
- **Individual brainstorming** → **Collaborative refinement** → **Group mashup**
- **Personal notes** → **Shared with partner** → **Published to group**

```html



```

### **3. Offline-First Perfect Match**
Loro CRDT handles your "thick building" scenarios elegantly:
- **Nils writes offline** on laptop → **Reconnects** → **Auto-syncs** with group
- **Lisa joins on tablet** → **Sees merged changes** instantly
- **Multiple devices** → **Conflict-free merging**

### **4. Future-Proof Activity System**
Your activity database becomes simpler:
```sql
-- Single document table for all activities
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    activity_id TEXT,           -- NULL for personal docs
    loro_doc_id TEXT NOT NULL,  -- Same CRDT for all types
    access_mode TEXT,           -- 'individual', 'collaborative', 'paired'
    can_edit TEXT              -- JSON array of participant IDs
);
```

## **Handling Different Writing Scenarios**

### **Individual Writing (Offline Mode)**
```typescript
// Create individual document
const personalDoc = await createDocument({
  type: 'individual',
  participants: [currentParticipant],
  syncMode: 'offline-first'
})

// Participant writes offline, syncs later
personalDoc.enableOfflineMode()
```

### **Collaborative Writing (Real-time)**
```typescript
// Same Loro doc, different permissions
const groupDoc = await createDocument({
  type: 'collaborative', 
  participants: groupMembers,
  syncMode: 'real-time'
})

// All participants can edit simultaneously
groupDoc.enableRealTimeSync()
```

### **Rhyming Game (Restricted Visibility)**
```typescript
// CRDT with visibility restrictions
const rhymeDoc = await createDocument({
  type: 'rhyme_paper',
  participants: [currentTurnPlayer],
  visibilityMode: 'last-line-only' // Business logic, not editor limitation
})
```

## **Markdown & Printing Benefits**

### **Unified Export System**
```typescript
// Single export function for all document types
export async function exportAsMarkdown(docId: string): Promise {
  const loroDoc = await getLoroDocument(docId)
  
  // Loro handles markdown conversion consistently
  return loroDoc.exportMarkdown({
    includeAuthors: true,
    timestampComments: false,
    cleanForPrint: true
  })
}
```

### **Print-Friendly Formatting**
```css
/* Single print stylesheet for all documents */
@media print {
  .loro-editor {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: black;
  }
  
  .collaboration-cursors { display: none; }
  .editing-controls { display: none; }
}
```

## **Minor Cons (Easily Mitigated)**

### **1. Slight Performance Overhead**
- **Individual docs don't need CRDT complexity**
- **Mitigation**: Loro is lightweight for single-user scenarios

### **2. Learning Curve**
- **Participants see collaboration features when writing alone**
- **Mitigation**: Simple UI that hides complexity when not needed

### **3. Network Overhead**
- **Solo writing doesn't need real-time sync**
- **Mitigation**: Configurable sync modes per document type

## **Implementation Strategy**

### **Phase 1: Core Loro Integration**
```typescript
// src/services/document.service.ts
export class DocumentService {
  async createDocument(config: DocumentConfig) {
    const loroDoc = new LoroDoc()
    
    // Configure based on writing type
    switch (config.type) {
      case 'individual':
        loroDoc.setMode('offline-first')
        break
      case 'collaborative':
        loroDoc.setMode('real-time')
        break
      case 'rhyme_paper':
        loroDoc.setMode('turn-based')
        break
    }
    
    return loroDoc
  }
}
```

### **Phase 2: UI Adaptation**
```html


  
  
  
    
  
  
  
  
    Bold
    Italic
    Heading
  
  
  
  

```

### **Phase 3: Document Lifecycle**
```typescript
// Seamless transitions between modes
export async function upgradeToCollaborative(docId: string, participants: string[]) {
  const doc = await getDocument(docId)
  
  // Add participants without losing content
  doc.addParticipants(participants)
  doc.enableRealTimeSync()
  
  // UI automatically updates to show collaboration features
  notifyParticipants('Document is now collaborative')
}
```

## **Why This Fits Your Workshop Model**

### **Creative Writing Flow**
1. **"Ideen sammeln"** → Individual Loro docs for brainstorming
2. **"Zusammen schreiben"** → Same docs, now collaborative
3. **"Vorlesen"** → Export to markdown, print with consistent formatting
4. **"Geschichten mischen"** → Merge individual docs into collaborative docs

### **Local-First Benefits**
- **Works offline** during thick building workshops
- **Auto-syncs** when connectivity returns
- **Conflict-free** merging when multiple people edited offline
- **Cross-device** continuity (laptop → tablet seamlessly)

### **Technical Simplicity**
- **One editor codebase** to maintain and improve
- **Consistent keyboard shortcuts** across all writing scenarios
- **Single export pipeline** for markdown and printing
- **Unified styling** for professional reading presentations

## **Bottom Line**

Use **unified Loro CRDT for everything**. The benefits of consistency, offline-first capability, and seamless collaboration transitions far outweigh the minor overhead. Your creative writing workshops will have a **professional, reliable, and simple** writing experience that works identically whether someone is writing alone or collaborating with 10 people around the virtual table.

This approach also future-proofs your app - when you add new activity types, they automatically inherit all the robust document handling, offline sync, and export capabilities you've built once.

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/81f9cabf-d26c-48c3-a4df-5c2fff26562a/initial-plan.md
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/2278e5fe-4dba-4975-96b8-10e4cb3d8313/CLAUDE.md
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/76587672-d55a-4630-b348-b30912072205/DEVELOPMENT.md
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/21ad249c-87e0-4892-b8ec-6119ad36274a/app-structure.md
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/6ffb511f-a04c-4b1c-b253-66c6ac9f807b/database-schema.md