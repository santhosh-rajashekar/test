module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'backend',
      script    : './bin/www',
      watch   : true,
      env: {
        NODE_ENV: 'development'
      },
      env_test: {
        NODE_ENV: 'test'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'lhtdev',
      host : 'hcm-prod-web-host1.westeurope.cloudapp.azure.com',
      ref  : 'origin/master',
      repo : 'https://saahmed:Altran2017!@git.altran.de/lufthansa/backend.git',
      path : '/home/lhtdev/hcm/backend',
      'post-deploy' : 'npm install; cp /home/lhtdev/secretconfig/ecosystem.config.js ./ecosystem.config.js; sequelize db:migrate --env test; ln -sf /data/hcm uploaded; ln -sf /data/hcm/temp uploads; pm2 startOrRestart ecosystem.config.js --update-env --env production'
    },
    test : {
      user : 'lhtdev',
      host : 'hcm-test-web-host1.westeurope.cloudapp.azure.com',
      ref  : 'origin/dev',
      repo : 'https://saahmed:Altran2017!@git.altran.de/lufthansa/backend.git',
      ssh_options: ["StrictHostKeyChecking=no", "PasswordAuthentication=yes"],
      script: './bin/www',
      env  : {
        NODE_ENV: 'test'
      },
      path : '/home/lhtdev/hcm/backend',
      'post-deploy' : 'npm install; cp /home/lhtdev/secretconfig/ecosystem.config.js ./ecosystem.config.js; sequelize db:migrate --env test; ln -sf /data/hcm uploaded; ln -sf /data/hcm/temp uploads; pm2 startOrRestart ecosystem.config.js --update-env --env test'
    },
    demo : {
      user : 'lhtdev',
      host : 'hcm-test-web-host1.westeurope.cloudapp.azure.com',
      ref  : 'origin/demo',
      repo : 'https://saahmed@git.altran.de/lufthansa/backend.git',
      ssh_options: ["StrictHostKeyChecking=no", "PasswordAuthentication=yes"],
      path : '/home/lhtdev/hcm/backend',
      'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env test',
      env  : {
        NODE_ENV: 'test'
      }
    }
  }
};
