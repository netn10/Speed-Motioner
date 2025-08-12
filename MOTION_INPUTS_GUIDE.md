# Motion Inputs Guide

This document explains the comprehensive motion input system added to Speed Motioner, including all the fighting game motion inputs that are now supported.

## Overview

The motion input system adds support for traditional fighting game special move inputs, allowing players to practice the most common motion inputs found in fighting games like Street Fighter, King of Fighters, Tekken, and more.

## Supported Motion Inputs

### 1. Quarter-Circle Motions
**Quarter-Circle Forward (QCF) - 236 + Attack**
- **Notation**: ↓↘→ + Attack
- **Example**: Ryu's Hadouken in Street Fighter
- **Input**: Down, Down-Right, Right + Attack Button
- **Simplified Training**: Down, Right + Attack

**Quarter-Circle Back (QCB) - 214 + Attack**
- **Notation**: ↓↙← + Attack  
- **Example**: Akuma's Ashura Senku
- **Input**: Down, Down-Left, Left + Attack Button
- **Simplified Training**: Down, Left + Attack

### 2. Half-Circle Motions
**Half-Circle Forward (HCF) - 41236 + Attack**
- **Notation**: ←↙↓↘→ + Attack
- **Example**: Zangief's Banishing Flat
- **Input**: Left, Down-Left, Down, Down-Right, Right + Attack Button
- **Simplified Training**: Left, Down, Right + Attack

**Half-Circle Back (HCB) - 63214 + Attack**
- **Notation**: →↘↓↙← + Attack
- **Example**: Clark's Argentina Backbreaker in KOF
- **Input**: Right, Down-Right, Down, Down-Left, Left + Attack Button
- **Simplified Training**: Right, Down, Left + Attack

### 3. Dragon Punch Motion
**DP Motion (Shoryuken Input) - 623 + Attack**
- **Notation**: →↓↘ + Attack
- **Example**: Ryu's Shoryuken
- **Input**: Right, Down, Down-Right + Attack Button
- **Simplified Training**: Right, Down, Right + Attack

### 4. Full Circle / 360° Motions
**360 Motion - 412369874 + Attack**
- **Notation**: Full 360° rotation + Attack
- **Example**: Zangief's Spinning Piledriver
- **Input**: Complete circle rotation starting from any direction + Attack Button
- **Note**: Currently simplified in training mode due to complexity

### 5. Charge Motions
**Charge Back, Forward - Hold ← ~2 sec, then → + Attack**
- **Example**: Guile's Sonic Boom
- **Input**: Hold Back for ~2 seconds, then Forward + Attack Button
- **Simplified Training**: Left, Right + Attack (without charge timing)

**Charge Down, Up - Hold ↓ ~2 sec, then ↑ + Attack**
- **Example**: Guile's Flash Kick
- **Input**: Hold Down for ~2 seconds, then Up + Attack Button
- **Simplified Training**: Down, Up + Attack (without charge timing)

### 6. Double Motions
**Double Quarter-Circle Forward (D-QCF) - 236236 + Attack**
- **Example**: Ryu's Shinku Hadouken
- **Input**: QCF, QCF + Attack Button
- **Training**: Down, Right, Down, Right + Attack

**Double Quarter-Circle Back (D-QCB) - 214214 + Attack**
- **Example**: Akuma's Messatsu Gou Hadou
- **Input**: QCB, QCB + Attack Button
- **Training**: Down, Left, Down, Left + Attack

## Training Modes

### Basic Motion Training
- **Mode ID**: `motion`
- **Description**: Practice basic movement and attack inputs
- **Patterns**: Single direction + attack combinations

### Fighting Game Motions Training
- **Mode ID**: `motions`  
- **Description**: Practice QCF, QCB, DP, HCF, HCB, Charge, and Double motions
- **Patterns**: All the motion inputs listed above

### Combo Training
- **Mode ID**: `combos`
- **Description**: Practice hit confirms and combos
- **Patterns**: Multi-attack sequences and movement + attack combinations

### Custom Challenge
- **Mode ID**: `custom`
- **Description**: Mixed patterns including some motion inputs
- **Patterns**: Combination of basic movements, attacks, and select motion inputs

## Technical Implementation

### Motion Input Recognition
The system uses numpad notation for internal representation:
```
7 8 9    ↖ ↑ ↗
4 5 6    ← N →  (5 = neutral)
1 2 3    ↙ ↓ ↘
```

### Pattern Matching
- **Exact Matching**: For precise training and validation
- **Lenient Matching**: Allows extra inputs between required inputs while maintaining order
- **Partial Matching**: Tracks progress through multi-input sequences

### Input Validation
- **Frontend**: Real-time validation with visual feedback
- **Backend**: Server-side validation for score tracking and leaderboards
- **Pattern Recognition**: Supports both WASD and arrow key inputs

## Display Features

### Motion Pattern Names
When in "Fighting Game Motions" training mode, the display shows:
- The motion pattern name (e.g., "QCF (236)")
- Visual input sequence with directional arrows
- Progress tracking through the sequence

### Visual Feedback
- **Success**: Green checkmark with points earned
- **Failure**: Red X for timeouts
- **Wrong Input**: Red X for incorrect inputs with timer reset
- **Progress**: Highlighted completed inputs in sequence

## Difficulty Settings

### Easy
- **Target**: 5 successful inputs
- **Time**: 3 seconds per input
- **Patterns**: Simpler motion inputs (QCF, QCB)

### Medium  
- **Target**: 10 successful inputs
- **Time**: 2 seconds per input
- **Patterns**: All motion inputs including DP and HCF/HCB

### Hard
- **Target**: 20 successful inputs  
- **Time**: 1 second per input
- **Patterns**: Complex motions including double motions

## Scoring System

### Base Points
- **100 points** for completing any motion input correctly

### Multipliers
- **Difficulty Multiplier**: Easy (1.0x), Medium (1.2x), Hard (1.5x)
- **Complexity Bonus**: +25 points per additional input beyond the first
- **Time Bonus**: Up to 50% bonus for fast completion

### Example Scoring
- QCF (3 inputs) on Medium difficulty completed quickly:
  - Base: 100 points
  - Complexity: +50 points (2 extra inputs × 25)
  - Difficulty: ×1.2 = 180 points
  - Time bonus: +40 points (fast completion)
  - **Total: 220 points**

## Controls

### Keyboard (WASD)
- **W**: Up (↑)
- **S**: Down (↓)  
- **A**: Left (←)
- **D**: Right (→)
- **J**: Light Punch (LP)
- **K**: Medium Punch (MP)
- **L**: Heavy Punch (HP)
- **U**: Light Kick (LK)
- **I**: Medium Kick (MK)
- **O**: Heavy Kick (HK)

### Keyboard (Arrow Keys)
- **↑**: Up
- **↓**: Down
- **←**: Left  
- **→**: Right
- **Attack buttons**: Same as WASD mode

### Gamepad Support
- **D-Pad**: Directional inputs
- **Face Buttons**: Attack buttons mapped according to settings
- **Supports**: 4-button and 6-button attack layouts

## Future Enhancements

### Planned Features
1. **True Charge Motion Timing**: Implement actual charge hold duration requirements
2. **360° Motion Recognition**: Full circular motion detection
3. **Advanced Patterns**: Pretzel motions, tiger knee inputs
4. **Custom Motion Editor**: Allow users to create their own motion patterns
5. **Motion Input History**: Visual representation of input timing and accuracy

### Advanced Training Modes
1. **Pressure Training**: Practice motions under time pressure
2. **Combo Integration**: Motion inputs within longer combo sequences  
3. **Situational Training**: Motion inputs after specific game states
4. **Tournament Mode**: Standardized motion input challenges

## Tips for Players

### Learning Motion Inputs
1. **Start Slow**: Begin with Easy difficulty to learn the patterns
2. **Focus on Accuracy**: Speed comes with practice, accuracy first
3. **Use Training Mode**: Practice individual motions before attempting combos
4. **Watch Your Timing**: Pay attention to the timer and try to complete inputs quickly

### Common Mistakes
1. **Rushing**: Don't sacrifice accuracy for speed
2. **Extra Inputs**: Avoid unnecessary button presses between motion inputs
3. **Wrong Direction**: Make sure directional inputs are precise
4. **Timing**: Don't wait too long between inputs in a sequence

### Progression Path
1. **Basic Motion** → Learn fundamental movement + attack
2. **Fighting Game Motions** → Master QCF, QCB, DP patterns  
3. **Combo Training** → Integrate motions into longer sequences
4. **Custom Challenge** → Test mixed patterns and advanced techniques

## Conclusion

The motion input system brings authentic fighting game training to Speed Motioner, allowing players to develop muscle memory for the most important special move inputs found in competitive fighting games. Whether you're learning your first Hadouken or perfecting complex double motions, this system provides structured practice with immediate feedback and progress tracking.

Start with the basics and work your way up to the most complex motions. With consistent practice, these motion inputs will become second nature!
