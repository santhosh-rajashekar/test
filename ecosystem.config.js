module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'backend',
      script    : 'app.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'test'
      }
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'node',
      host : 'hcm-app.westeurope.cloudapp.azure.com',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    test : {
      user : 'lhtdev',
      host : 'test-hcm-app.westeurope.cloudapp.azure.com',
      ref  : 'origin/master',
      repo : 'https://saahmed:Altran2015!@git.altran.de/lufthansa/backend.git',
      ssh_options: ["StrictHostKeyChecking=no", "PasswordAuthentication=yes"],
      path : '/home/lhtdev/hcm/backend',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env test',
      env  : {
        NODE_ENV: 'test'
      }
    }
  }
};
