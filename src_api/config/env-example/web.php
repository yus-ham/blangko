<?php

$config = [
    'components' => [
        'request' => [
            // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => '',
        ],
    ],
];


if (YII_ENV_DEV)
{
    class DisabledPanel extends yii\debug\Panel { function isEnabled() { return false; } }

    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
            'class' => 'yii\debug\Module',
            // uncomment the following to add your IP if you are not connecting from localhost.
            //'allowedIPs' => ['127.0.0.1', '::1'],
            'disableCallbackRestrictionWarning' => true,
            'panels' => [
                'user' => ['class' => 'DisabledPanel']
            ],
    ];
}
else
{
    $config['components']['log']['targets']['file']['maskVars'] = ['_POST.password', '_POST.LoginForm.password'];
}

return $config;
