# Local Storage Service Documentation

## Storage Structure

### Versioned Storage Format

The storage service uses a versioned wrapper to support future schema migrations:

```typescript
interface StorageWrapper {
  version: number;        // Current version: 1
  data: ProgressData;     // Actual progress data
}
```

### Storage Key

**Key:** `recalliq_progress_v1`

The versioned key allows for clean schema evolution and migration support.

### ProgressData Structure

```typescript
interface ProgressData {
  sessionHistory: Array<{
    sessionId: string;        // Unique session identifier
    chapterName: string;      // Human-readable chapter name or "Mixed Challenge"
    score: number;            // Number correct (0-10)
    accuracy: number;         // Percentage (0-100)
    completionTime: number;   // Time in milliseconds
    timestamp: number;        // Unix timestamp when session completed
  }>;
}
```

### Example Storage Content

```json
{
  "version": 1,
  "data": {
    "sessionHistory": [
      {
        "sessionId": "1728123456789-abc123",
        "chapterName": "Squares",
        "score": 8,
        "accuracy": 80,
        "completionTime": 125000,
        "timestamp": 1728123456789
      },
      {
        "sessionId": "1728123567890-def456",
        "chapterName": "Mixed Challenge",
        "score": 7,
        "accuracy": 70,
        "completionTime": 145000,
        "timestamp": 1728123567890
      }
    ]
  }
}
```

## API Functions

### loadProgressFromStorage()

**Returns:** `ProgressData`

Loads user progress from local storage.

**Behavior:**
- First-time users: Returns empty default structure `{ sessionHistory: [] }`
- Valid data: Returns parsed progress data
- Corrupted data: Returns default structure, logs error
- Legacy data: Migrates to versioned format automatically

**Error Handling:**
- JSON parse errors → default structure
- Invalid structure → default structure
- Version mismatch → default structure (future: migrate)
- Storage access errors → default structure

### saveProgressToStorage(currentProgress, results, chapters)

**Parameters:**
- `currentProgress: ProgressData` - Current progress state
- `results: SessionResults` - Session results to append
- `chapters: Chapter[]` - Available chapters for name lookup

**Returns:** `ProgressData` - Updated progress data

**Behavior:**
- Appends new session to history
- Looks up chapter name from ID
- Uses "Mixed Challenge" for null chapter ID
- Uses "Unknown" for invalid chapter ID
- Wraps data with version before saving
- Throws on storage quota or access errors

**Error Handling:**
- QuotaExceededError → throws with message
- SecurityError → throws with message
- Other errors → throws with message

### clearProgressStorage()

**Returns:** `void`

Clears all stored progress data. Destructive operation.

### getStorageInfo()

**Returns:** `{ hasData: boolean; entryCount: number; sizeBytes: number }`

Returns information about stored data for debugging.

## Initialization & Default State

### First-Time Users

When no data exists in storage:

```typescript
{
  sessionHistory: []
}
```

### After First Session

```typescript
{
  version: 1,
  data: {
    sessionHistory: [
      {
        sessionId: "...",
        chapterName: "Fractions & Percentages",
        score: 9,
        accuracy: 90,
        completionTime: 98000,
        timestamp: 1728123456789
      }
    ]
  }
}
```

## Error & Corruption Handling

### Corrupted Data Scenarios

1. **Invalid JSON**
   - Returns: Default empty structure
   - Logs: Error message to console
   - User impact: Loses progress but app remains functional

2. **Missing version field** (Legacy data)
   - Returns: Migrated data
   - Action: Auto-migrates to versioned format
   - User impact: Seamless, progress preserved

3. **Invalid structure**
   - Returns: Default empty structure
   - Logs: Error message to console
   - User impact: Loses corrupted progress

4. **Version mismatch**
   - Returns: Default empty structure (v1)
   - Logs: Warning message
   - Future: Will trigger migration logic

### Storage Errors

1. **QuotaExceededError**
   - Throws error with message
   - User should be notified to free space
   - Previous sessions remain intact

2. **SecurityError**
   - Throws error with message
   - User should check browser privacy settings
   - App remains functional, just can't save

3. **Other Storage Errors**
   - Throws error with descriptive message
   - Caller can handle or display to user

## Schema Migration Support

### Current Version: 1

The versioned wrapper enables future schema changes:

```typescript
// Example future migration
if (wrapper.version === 1) {
  // Migrate v1 → v2
  const v2Data = {
    ...wrapper.data,
    newField: defaultValue,
  };
  return v2Data;
}
```

### Migration Strategy

1. Detect version in `loadProgressFromStorage()`
2. Apply transformation to newer version
3. Save migrated data automatically
4. Return updated structure

This ensures users never lose data during app updates.
