# README

This repository contains code and resources for Assmac a single page shop. 

## Getting Started

- run `mise install`. 
- run `npm install && cd client && npm install && cd -` to install dependencies.
- run `docker compose up -d`
- run `bin/rails db:migrate` to setup the database.
- get the .env file for the frontend and backend.
- run `bin/dev` to start the development server.
- go into client folder and run `npm run dev` to start the frontend server.
- run bruno and run the create product. 
- you can go to  http://localhost:1234
- if you want to test payment run stripe cli with `stripe listen --forward-to localhost:3000/webhooks/stripe`

## Technologies Used

- Ruby on Rails
- React + Vike