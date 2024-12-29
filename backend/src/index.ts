import app from './app';

// Start the server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
