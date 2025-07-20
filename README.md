# TaskFlow - Modern Task Management Platform

A comprehensive project management tool with real-time collaboration, drag-and-drop functionality, team workspaces, and advanced filtering. Think Trello meets Notion.

![TaskFlow Platform](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 🎯 Core Functionality
- **User Authentication & Team Workspaces** - Secure login/signup with team collaboration
- **Drag-and-Drop Task Boards** - Intuitive Kanban-style task management
- **Real-time Collaboration** - Work together seamlessly with your team
- **Task Assignments & Due Dates** - Assign tasks and set priorities
- **File Attachments & Comments** - Rich task context with files and discussions
- **Advanced Filtering & Search** - Find tasks quickly with powerful filters
- **Dashboard Analytics** - Track progress and team performance
- **Responsive Design** - Works perfectly on all devices

### 🎨 Design & UX
- **Professional UI/UX** - Apple-level design aesthetics
- **Smooth Animations** - Framer Motion for engaging interactions
- **Modern Tech Stack** - React, TypeScript, Tailwind CSS
- **Component Architecture** - Clean, maintainable code structure

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow-management-platform.git
   cd taskflow-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
taskflow-management-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnalyticsCard.tsx
│   │   ├── KanbanBoard.tsx
│   │   └── TaskCard.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── Workspace.tsx
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── README.md             # Project documentation
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Language**: TypeScript 5.0.2
- **Build Tool**: Vite 4.4.5
- **Styling**: Tailwind CSS 3.3.3
- **Animations**: Framer Motion 10.16.4
- **Icons**: Lucide React 0.263.1
- **Drag & Drop**: React Beautiful DnD 13.1.1
- **Date Handling**: date-fns 2.30.0
- **Routing**: React Router DOM 6.8.1

## 🎯 Key Features Explained

### 1. Landing Page
- Professional design showcasing platform features
- Smooth scroll animations and testimonials
- Clear call-to-action for signup

### 2. Authentication System
- Beautiful login/signup forms with validation
- Password visibility toggle
- Form error handling and loading states
- Responsive design for all devices

### 3. Dashboard Interface
- Analytics cards showing key metrics
- Workspace selection and navigation
- Search functionality for tasks
- User profile and notifications

### 4. Kanban Board
- Drag-and-drop task management
- Four-column workflow (To Do, In Progress, Review, Done)
- Task cards with priority indicators
- Assignee avatars and due dates
- Tags and attachments support

### 5. Workspace Management
- Detailed workspace information
- Team member management
- Workspace-specific Kanban boards
- Member roles and permissions

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Main brand color
- **Success**: Green (#10B981) - Positive actions
- **Warning**: Yellow (#F59E0B) - Caution states
- **Error**: Red (#EF4444) - Error states
- **Gray Scale**: 50-900 for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately on all devices

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary and secondary variants
- **Inputs**: Focus states with ring indicators
- **Animations**: Smooth transitions and hover effects

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting
- **Vercel**: Zero-config deployment
- **Netlify**: Easy CI/CD integration
- **GitHub Pages**: Free hosting for open source
- **AWS S3**: Scalable static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Lucide** - For beautiful icons
- **Vite** - For the fast build tool

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ by the TaskFlow Team** 