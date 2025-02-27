# Project: []

## 🙊 Description

Backend code for ACME BUY

## 🏃‍➡️ How to Run

- Use `npm install` to install required packages.
- Use `npm run dev` to start the server.

## 🥞 Tech Stack

- **Password Security**: argon2
- **Cookie**: cookie-parser
- **JWT**: jsonwebtoken
- **Real-time Chat**: socket.io
- **Media (Image) Storage Management**: cloudinary
- **Cross-Origin Resource Sharing**: cors
- **Database**: mongoose
- **File Upload**: formidable (?should I remove it?), graphql-upload
- **Payment**: stripe
- **Other Packages**: uuid, date-fns, dotenv
- **API**: GraphQL (Apollo), RESTful

## 🦄 Unique Features

- password encryption
- for generic gql error, send to clinet the general "internal server error"; but for detailed error, show it to clients

## 🏋️‍♀️ Challenges Faced

- Get data from public API and populate database with data: https://coverartarchive.org/, https://musicbrainz.org/doc/Cover_Art_Archive/API

## 🏋️‍♀️ Attetion to Details

- All routes check if the user role has access to the resource.

## 📋 Coming Next

- [ ] When to use OAuth over jsonwebtoken?
- [ ] should I use http-errors package?
- [ ] delete image from cloudinary if image is removed
- [ ] database password
- [ ] FK constraint: (1) user:wishlist - product:id; (2) product.userId - user.id; (3) check all other Schema.Types.ObjectId in schema definition
