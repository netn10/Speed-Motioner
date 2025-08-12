# Custom Combos Feature

## Overview
The Custom Combos feature allows users to create, save, load, and practice their own custom input combinations. This feature enhances the training experience by enabling users to practice specific combos that are relevant to their fighting game of choice.

## Features

### 1. Custom Combo Creation
- **Input Recording**: Users can record inputs in real-time by pressing keys
- **Manual Input Addition**: Users can manually add inputs using button clicks
- **Combo Preview**: Real-time preview of the combo being created
- **Input Removal**: Remove individual inputs from the combo
- **Clear All**: Clear all inputs and start over

### 2. Combo Management
- **Save Combos**: Save combos with custom names and descriptions
- **Edit Combos**: Modify existing combos (name, description, inputs)
- **Delete Combos**: Remove unwanted combos
- **Combo List**: View all saved combos with metadata
- **Persistence**: Combos are automatically saved to local storage

### 3. Training Integration
- **Custom Combo Mode**: New training mode specifically for custom combos
- **Combo Selection**: Choose which custom combo to practice
- **Training Display**: Shows combo name and description during training
- **Combo Validation**: Proper validation and scoring for custom combos

## How to Use

### Creating a Custom Combo

1. **Navigate to Training Menu**
   - Open the application and go to the Training Menu

2. **Select Custom Combos Mode**
   - Choose "Custom Combos" from the training type options

3. **Open Combo Manager**
   - Click "Select Custom Combo" or "Change Combo" button

4. **Create New Combo**
   - Click "+ Create New Combo" button

5. **Fill Combo Details**
   - **Name**: Enter a descriptive name for your combo
   - **Description**: (Optional) Add additional details about the combo

6. **Add Inputs**
   - **Method 1 - Recording**:
     - Click "🎙️ Start Recording"
     - Press the actual keys (WASD for movement, JKL for punches, UIO for kicks)
     - Click "⏹️ Stop Recording" when done
   
   - **Method 2 - Manual**:
     - Click the input buttons to add them to the combo
     - Use the preview to see the current combo

7. **Save the Combo**
   - Click "Save Combo" to store it

### Practicing Custom Combos

1. **Select Custom Combos Mode**
   - Choose "Custom Combos" from the training menu

2. **Choose a Combo**
   - Select a saved combo from the list
   - Or click "Select Custom Combo" to browse

3. **Start Training**
   - Click "Start Training" to begin practicing the selected combo

4. **Practice**
   - Follow the on-screen instructions
   - The combo name and description will be displayed
   - Complete the combo within the time limit

## Technical Implementation

### File Structure
```
frontend/src/
├── components/
│   ├── CustomComboManager.jsx      # Main combo management UI
│   ├── CustomComboManager.css      # Styling for combo manager
│   ├── TrainingMenu.jsx            # Updated with combo selection
│   └── TrainingInputDisplay.jsx    # Updated with custom combo support
├── stores/
│   ├── trainingStore.js            # Updated with combo management
│   └── gameStore.js                # Updated with combo validation
└── utils/
    └── motionInputs.js             # Updated with custom combo patterns
```

### Key Components

#### CustomComboManager.jsx
- **State Management**: Manages form data, recording state, and combo list
- **Input Recording**: Handles keyboard events for real-time input recording
- **CRUD Operations**: Create, read, update, delete combos
- **UI Components**: Form, combo list, input buttons, preview

#### trainingStore.js
- **Custom Combos Array**: Stores all saved combos
- **CRUD Functions**: 
  - `saveCustomCombo(combo)`
  - `updateCustomCombo(comboId, updates)`
  - `deleteCustomCombo(comboId)`
  - `getAllCustomCombos()`
  - `getCustomCombo(comboId)`
  - `clearCustomCombos()`
- **Persistence**: Uses Zustand persist middleware

#### TrainingMenu.jsx
- **Custom Combo Mode**: New training mode option
- **Combo Selection UI**: Interface for selecting custom combos
- **Integration**: Connects combo selection with training session

#### TrainingInputDisplay.jsx
- **Custom Combo Support**: Displays custom combo name and description
- **Pattern Generation**: Uses custom combo inputs for training patterns
- **Validation**: Integrates with combo validation system

### Data Flow

1. **Combo Creation**:
   ```
   User Input → CustomComboManager → trainingStore.saveCustomCombo() → Local Storage
   ```

2. **Combo Selection**:
   ```
   TrainingMenu → Combo Selection → trainingStore → Session Config
   ```

3. **Training**:
   ```
   Session Config → TrainingInputDisplay → Pattern Generation → Validation
   ```

4. **Validation**:
   ```
   User Input → gameStore.addInput() → Combo Validation → Score Update
   ```

## Input Mapping

The system maps keyboard inputs to game inputs as follows:

| Keyboard | Game Input | Description |
|----------|------------|-------------|
| W        | Up         | Jump/Up movement |
| S        | Down       | Crouch/Down movement |
| A        | Left       | Left movement |
| D        | Right      | Right movement |
| J        | LP         | Light Punch |
| K        | MP         | Medium Punch |
| L        | HP         | Heavy Punch |
| U        | LK         | Light Kick |
| I        | MK         | Medium Kick |
| O        | HK         | Heavy Kick |

## Styling

The custom combo feature uses CSS custom properties for theming:

```css
.custom-combo-manager {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
```

Key styling features:
- **Responsive Design**: Adapts to different screen sizes
- **Theme Support**: Works with light/dark themes
- **Modern UI**: Clean, intuitive interface
- **Visual Feedback**: Hover effects, animations, status indicators

## Testing

A test file is included at `frontend/src/test/custom-combo-test.js` that can be run in the browser console to verify functionality:

```javascript
// Run in browser console
testCustomComboFunctionality()
```

## Future Enhancements

Potential improvements for the custom combo feature:

1. **Combo Categories**: Organize combos by game or character
2. **Combo Sharing**: Export/import combos between users
3. **Combo Templates**: Pre-built templates for common fighting games
4. **Advanced Recording**: Support for gamepad input recording
5. **Combo Statistics**: Track success rates and improvement over time
6. **Combo Variations**: Create variations of existing combos
7. **Bulk Operations**: Select multiple combos for batch operations

## Troubleshooting

### Common Issues

1. **Inputs Not Recording**:
   - Ensure recording is active (button shows "Recording...")
   - Check that you're pressing the correct keys
   - Verify the input mapping in the documentation

2. **Combo Not Saving**:
   - Ensure combo has a name
   - Ensure combo has at least one input
   - Check browser console for errors

3. **Combo Not Appearing in Training**:
   - Verify combo was saved successfully
   - Check that you've selected the combo in training menu
   - Ensure you're in "Custom Combos" training mode

4. **Validation Issues**:
   - Check that input mapping matches your settings
   - Verify combo inputs are in the correct format
   - Ensure training session is properly configured

### Debug Information

Enable debug logging by checking the browser console for:
- Combo save/load operations
- Training session configuration
- Input validation results
- Error messages

## Conclusion

The Custom Combos feature provides a powerful and flexible way for users to create and practice their own input combinations. The intuitive interface makes it easy to create, manage, and practice custom combos, while the robust technical implementation ensures reliable performance and data persistence.
