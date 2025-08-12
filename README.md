# Speed Motioner - Fighting Game Trainer

A modern web-based fighting game training tool designed to help players improve their execution, timing, and combo skills.

## Features

- **Motion Training**: Practice special move inputs with visual feedback
- **Blocking Practice**: Improve your blocking timing and reactions
- **Punish Training**: Learn to punish unsafe moves effectively
- **Combo Training**: Practice hit confirms and complex combos
- **Real-time Feedback**: Instant input validation and scoring
- **Multiple Difficulties**: Easy, Medium, and Hard modes
- **Customizable Controls**: Fully customizable input button mappings
- **Theme Support**: Light and dark mode themes
- **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Konva** - 2D canvas library for game rendering
- **Socket.IO Client** - Real-time communication
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speed-motioner
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to start training!

## Controls

### Default Controls
- **W/A/S/D** or **Arrow Keys** - Movement (Up/Left/Down/Right)
- **J** - Light Punch
- **K** - Medium Punch  
- **L** - Heavy Punch
- **U** - Light Kick
- **I** - Medium Kick
- **O** - Heavy Kick
- **Mouse Click** - Move player position

### Gamepad Support
- **Left Stick/D-Pad** - Movement
- **A Button** - Light Punch
- **B Button** - Medium Punch
- **X Button** - Light Kick
- **Y Button** - Medium Kick
- **RB (Right Bumper)** - Heavy Punch
- **RT (Right Trigger)** - Heavy Kick

### Customizing Controls
You can customize all input buttons in the Settings menu:
1. Click the "⚙️ Settings" button in the main menu
2. Click on any input button to change its key binding
3. Press a key or click from the available options
4. Your settings are automatically saved

### Available Button Options
All letters (A-Z), numbers (0-9), and common keys are available for customization.

## Training Modes

### Motion Training
Practice special move inputs like:
- Up + Attack (↑ + A)
- Down + Special (↓ + B)
- Left + Attack (← + A)
- Right + Special (→ + B)

### Blocking Practice
Improve your blocking timing:
- Block (Block)
- Direction + Block (←/→/↑/↓ + Block)

### Punish Training
Learn to punish unsafe moves:
- Double Attack (A + A)
- Attack + Special (A + B)
- Special + Attack (B + A)

### Combo Training
Practice complex combinations:
- Triple Attack (A + A + A)
- Attack + Special + Attack (A + B + A)
- Up Attack + Down Attack (↑ + A + ↓ + A)

## Difficulty Levels

- **Easy**: 1-second input window, 70% accuracy required
- **Medium**: 0.5-second input window, 80% accuracy required  
- **Hard**: 0.2-second input window, 90% accuracy required

## Settings & Customization

### Theme Options
- **Light Mode**: Clean, bright interface for daytime use
- **Dark Mode**: Easy on the eyes for low-light environments

### Input Customization
- **Movement**: Customize Up, Down, Left, Right controls
- **Actions**: Customize Attack, Special, and Block buttons
- **Real-time Updates**: Changes apply immediately during gameplay
- **Persistent Settings**: Your preferences are saved automatically

### Reset Options
- **Reset to Defaults**: Quickly restore default button mappings
- **Individual Changes**: Modify specific buttons without affecting others

## Development

### Project Structure
```
speed-motioner/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom hooks
│   │   └── test/            # Test setup
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js backend
│   ├── server.js            # Main server file
│   ├── gameManager.js       # Game logic
│   └── package.json
└── README.md
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Testing
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by fighting game training modes
- Built with modern web technologies
- Designed for accessibility and performance
