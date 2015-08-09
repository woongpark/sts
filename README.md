# How to run

1. Install [node.js](http://nodejs.org/)
2. Install `bower` to grab dependencies, `less` to compile style sheets and
`http-server` to run the website

     `npm install -g bower less http-server`

3. Compile less css files into a single stylesheet

    `lessc --clean-css styles/main.less > styles/main.css`

4. Serve up the website

    `http-server`

5. Browse to [http://localhost:8080/](http://localhost:8080/) to see the
visualization
