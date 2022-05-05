<?php

$feConfig = json_decode(file_get_contents($ROOT .'../config.env.json'));


return [
    'components' => [
        'request' => [
            // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => '',
        ],

        'log' => [
            'targets' => [
                'file' => [
                    'maskVars' => ['_POST.password', '_POST.LoginForm.password'],
                ]
            ]
        ],
    ],

    'as rest' => [
        'cors' => [
            'Origin' => ['http://localhost:'.$feConfig->server->port],
            'Access-Control-Allow-Credentials' => true
        ]
    ],

    // configuration adjustments for 'dev' environment
    'bootstrap' => YII_DEBUG ? ['debug'] : [],
    'modules' => YII_DEBUG ? [
        'debug' => [
            'class' => 'yii\debug\Module',
            // uncomment the following to add your IP if you are not connecting from localhost.
            //'allowedIPs' => ['127.0.0.1', '::1'],
            'disableCallbackRestrictionWarning' => true,
            // 'checkAccessCallback' => function() {
            //     return \Yii::$app->controller && \Yii::$app->controller->module->id !== 'debug_api';
            // },
            'panels' => [
                'user' => [
                    'class' => 'yii\debug\panels\UserPanel',
                    // 'filterModel' => 'app\models\auth\User',
                    'ruleUserSwitch' => [
                        'allow' => true,
                        'matchCallback' => function () {
                            return \Yii::$app->user->identity
                            && \Yii::$app->user->identity->user_role_id == 1; // admin only
                        },
                    ],
                ],
            ],
        ]
    ] : []
];
