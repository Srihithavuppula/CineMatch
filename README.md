# Movie Recommendation System

## Overview
This project is a full-stack Movie Recommendation System that provides both content-based and personalized movie recommendations. It allows users to search for movies, view details, add favorites, write reviews, and receive intelligent suggestions based on their preferences.

## Project Structure

This project is divided into two branches:

- Frontend: main branch (React application)
- Backend: master branch (Spring Boot application)

To run the full project, clone the repository and switch between branches:

-git checkout main     # for frontend
-git checkout master   # for backend

## Features
- User authentication using JWT
- Search movies by title
- View movie details with description and ratings
- Add and remove favorites
- Write and manage reviews
- Content-based recommendations using TF-IDF and cosine similarity
- Personalized recommendations based on user activity
- Integration with TMDB API for posters and ratings

## Tech Stack

### Frontend
- React
- Axios
- CSS

### Backend
- Spring Boot
- REST APIs
- JWT Authentication

### Database
- MySQL
- Spring Data JPA

### External API
- TMDB API

## Project Structure

### Backend
- Controller: Handles HTTP requests
- Service: Business logic and recommendation engine
- Repository: Database operations using JPA
- DTO: Data transfer objects for responses

### Frontend
- Components: Movie cards, modals
- Pages: Dashboard, Recommendation, Auth pages
- API Layer: Axios configuration

## How It Works
1. User interacts with frontend
2. Requests go to backend APIs
3. Backend fetches data from database
4. Recommendation logic processes data
5. Results are returned and displayed on frontend

## Recommendation Logic

### Content-Based Filtering
- Uses movie description and genres
- TF-IDF converts text into vectors
- Cosine similarity compares movies

### Personalized Recommendations
- Uses user favorites and high-rated reviews
- Finds similar movies for each liked movie
- Combines scores and ranks results
- Removes already seen movies

## Database Design
Entities:
- User
- Movie
- Review
- Favorite
- Genre
- Movie_Genres

## Setup Instructions

### Backend
- Configure MySQL in application.properties
- Run Spring Boot application

### Frontend
npm install
npm run dev

## API Endpoints

### Auth
POST /auth/login  
POST /auth/register  

### Movies
GET /movies  
GET /movies/search?title={title}  

### Recommendations
GET /recommendations/movie/{movieId}  
GET /recommendations/user/{userId}  

### Reviews
GET /reviews/movie/{movieId}  
POST /reviews  

### Favorites
GET /favorites  
POST /favorites/{movieId}  
DELETE /favorites/{movieId}  

## Future Improvements
- Collaborative filtering
- Hybrid recommendation system
- Better UI/UX
- Cloud deployment

## Conclusion
This project demonstrates a full-stack application combining user data and content-based filtering to build an intelligent movie recommendation system.
