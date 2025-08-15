# 🤖 AI Chatbot Persona

A beautiful, interactive AI chatbot application featuring authentic personas of real tech educators. Chat with AI versions of **Hitesh Choudhary** and **Piyush Garg** with their authentic personalities, communication styles, and expertise.

## ✨ Features

- **Authentic Personas**: Real personalities of Hitesh Choudhary and Piyush Garg
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Dual Language Support**: Hindi-English mixed communication (Hinglish)
- **Real Profile Pictures**: Actual profile images of both personas
- **Authentic Communication**: Real phrases, expressions, and speaking styles
- **Wide Knowledge Base**: Extensive expertise areas and tutorial references

## 🚀 Live Demo

Visit the application at: [http://localhost:3000](http://localhost:3000)

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gemini API Key

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd persona
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Setup

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Add Profile Images

Place the profile images in the `public/images/` directory:

```bash
mkdir -p public/images
# Add hitesh.png and piyush.png to this directory
```

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Personas

### Hitesh Choudhary
- **Role**: Coding Teacher & YouTuber
- **Experience**: 15+ years in tech education
- **Students**: 1.6M+ students worldwide
- **Signature**: "Hanji!" greeting and chai references
- **Expertise**: JavaScript, React, Node.js, Full Stack Development
- **Communication**: Hindi-English mixed with authentic phrases

### Piyush Garg
- **Role**: Content Creator, Educator & Entrepreneur
- **YouTube**: 287K+ subscribers, 449+ videos
- **Startup**: Founder & CEO @ Teachyst (NextGen LMS)
- **Signature**: "Trust me, I'm a software engineer."
- **Expertise**: System Design, Full Stack Development, AI/ML
- **Communication**: Hinglish with technical enthusiasm

## 🏗️ Project Structure

```
persona/
├── src/
│   ├── app/
│   │   ├── api/chat/route.js    # AI chat API endpoint
│   │   ├── layout.js            # Root layout
│   │   ├── page.js              # Main page with persona selection
│   │   └── globals.css          # Global styles
│   └── components/
│       ├── PersonaSelector.js   # Persona selection interface
│       └── ChatInterface.js     # Chat interface component
├── public/
│   └── images/                  # Profile images
├── package.json
└── README.md
```

## 🔧 Technologies Used

- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - Latest React version
- **Tailwind CSS v4** - Modern styling
- **Framer Motion** - Smooth animations
- **Gemini AI** - AI chat backend
- **OpenAI SDK** - API integration

## 📱 Features

### Persona Selection
- Beautiful animated cards
- Real profile pictures
- Authentic descriptions
- Smooth hover effects

### Chat Interface
- Modern messaging design
- Real-time typing indicators
- Message timestamps
- Responsive layout
- Back navigation

### AI Integration
- Dynamic persona switching
- Authentic communication styles
- Wide knowledge base
- Real social media references

## 🎨 Customization

### Adding New Personas

1. Add persona data to `src/app/api/chat/route.js`
2. Update `src/app/page.js` with new persona card
3. Add profile image to `public/images/`
4. Configure communication style and expertise

### Styling

- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components
- Customize animations in Framer Motion

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Other Platforms

```bash
npm run build
npm run start
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini AI API key | Yes |

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 🙏 Acknowledgments

- **Hitesh Choudhary** - For his authentic teaching style and chai culture
- **Piyush Garg** - For his technical expertise and entrepreneurial spirit
- **Next.js Team** - For the amazing framework
- **Gemini AI** - For the AI capabilities


---

**Built with ❤️ and lots of chai ☕**
