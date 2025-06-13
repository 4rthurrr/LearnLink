# LearnLink

A collaborative learning platform designed to connect learners, facilitate knowledge sharing, and provide personalized learning experiences through social interaction and AI-powered recommendations.

## 🌟 Features

### User Management & Authentication
- **OAuth 2.0 Integration** - Secure authentication with Google
- **User Profiles** - Comprehensive profile management system
- **Follow/Unfollow System** - Build your learning network

### Social Learning
- **Skill Sharing Posts** - Share knowledge and expertise with the community
- **Real-time Interactions** - Like, comment, and engage with posts instantly
- **Real-time Notifications** - Stay updated with community activities

### Personalized Learning
- **AI-Powered Learning Plans** - Customized learning paths based on your goals
- **Progress Tracking** - Monitor your learning journey with detailed analytics
- **Smart Search** - Find relevant content, users, and learning materials

### Analytics & Insights
- **Learning Analytics Dashboard** - Track your progress and achievements
- **Community Insights** - Understand learning trends and popular topics

## 🚀 Technology Stack

### Backend
- **Java Spring Boot** - RESTful API development
- **Spring Security** - Authentication and authorization
- **MySQL** - Primary database
- **Maven** - Dependency management

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway (in progress)
- **Database**: MySQL hosted on Railway

## 👥 Team & Contributions

This project was developed by a team of 4 dedicated developers:

### Shanuka (Team Lead)
- User Management System with OAuth 2.0
- User Profile Management
- Analytics Dashboard
- Search Functionality
- Follow/Unfollow System

### Erandi
- Real-time Notification System
- Social Interaction Features (Like/Unlike)
- Comment System
- Real-time Updates

### Chathuka
- Learning Plan Management System
- AI-powered Learning Recommendations
- Progress Tracking

### Dumi
- Skill Sharing Post Management
- Content Management System
- Post Creation and Editing

## 🛠️ Installation & Setup

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/4rthurrr/LearnLink.git
cd LearnLink/backend
```

2. Configure database connection in `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learnlink
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Set up environment variables
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

4. Build and run the backend
```bash
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd LearnLink/frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables in `.env`
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server
```bash
npm start
```

## 📱 Usage

1. **Sign Up/Login** - Use Google OAuth to create an account
2. **Complete Profile** - Set up your learning preferences and skills
3. **Explore Content** - Browse skill-sharing posts and learning materials
4. **Create Learning Plans** - Set goals and track your progress
5. **Engage with Community** - Follow users, like posts, and share knowledge
6. **Track Progress** - Monitor your learning journey through analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow/{userId}` - Follow a user
- `DELETE /api/users/unfollow/{userId}` - Unfollow a user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Learning Plans
- `GET /api/learning-plans` - Get user's learning plans
- `POST /api/learning-plans` - Create learning plan
- `PUT /api/learning-plans/{id}` - Update learning plan

## 🚧 Current Status

The application is currently in development with the following status:
- ✅ Frontend deployed on Vercel
- 🔄 Backend deployment in progress (exploring alternatives to Railway)
- ✅ Core features implemented and tested
- 🔄 Final testing and optimization ongoing

## 🤝 Contributing

We welcome contributions to LearnLink! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or suggestions, feel free to reach out to our team:

- **Project Repository**: [GitHub Link]
- **Live Demo**: [Coming Soon]

---

*Built with ❤️ by the LearnLink Team*
