cd app
npm install
npm run build
cp -rf build ../api
cd ../api
npm install
mkdir -p public/subtitles
mkdir MovieLibrary
npm start
export PATH=$PATH:`pwd`/bin
open http://localhost:8080