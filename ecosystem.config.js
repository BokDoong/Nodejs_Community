module.exports = {
  apps: [
    {
      name: "api",
      script: "./src/server-register.js",
      exec_mode: "cluster",
      watch: false,
      instances: 0,
    }
  ]
}