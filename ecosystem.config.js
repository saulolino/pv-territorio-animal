module.exports = {
  apps: [
    {
      name: "pv-territorio-animal",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/data/www/projects/pv-territorio-animal",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3060,
        HOSTNAME: "127.0.0.1",
      },
      env_file: ".env.local",
      error_file: "/var/log/pv-territorio-animal/error.log",
      out_file: "/var/log/pv-territorio-animal/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
