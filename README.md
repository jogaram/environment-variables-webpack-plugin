# Environment variable replacing plugin for WebPack

### How to use

1. Add some variable in your code following pattern %%var%%
``` javascript
    new AuthConfiguration({endpoint: "%%my.var%%"})
```

2. Create an environment variable set JSON file

``` javascript
// config/dev.json
    {
        "my": {"var": "Hello!"}
    }
```

3. Add reference to the plugin from your webpack configuration
``` javascript
    //config/webpack.dev.js
    
    var webpackMerge = require('webpack-merge');
    var EnvironmentVariablesPlugin = require('./replace-webpack-plugin');
    var commonConfig = require('./webpack.common.js');
    
    module.exports = webpackMerge(commonConfig, {
        
        
        plugins: [
            new EnvironmentVariablesPlugin({
                optionsFile: 'config/dev.json',
                chunks: ['angularApp']
            })
        ],
    
    });
```
