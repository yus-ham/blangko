<?php

namespace app\components;

use Yii;

class SoftDeleteAction extends \yii\rest\DeleteAction
{
    public function findModel($id)
    {
        $model = parent::findModel($id);
        $model->attachBehavior('soft-delete', [
            'replaceRegularDelete' => true,
            'softDeleteAttributeValues' => ['deleted' => fn ($ar) => Yii::$app->user->id . '@' . time()],
            'class' => \yii2tech\ar\softdelete\SoftDeleteBehavior::class,
        ]);
        return $model;
    }

    public function run($id)
    {
        try {
            parent::run($id);
        } catch (\Throwable $e) {
        }
        Yii::$app->response->statusCode = 204;
    }
}
