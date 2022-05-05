<?php

namespace app\components;

use Yii;

abstract class ActiveController extends \yii\rest\ActiveController
{
    public $softDelete = true;

    public function actions()
    {
        $acts = parent::actions();

        if ($this->softDelete) {
            $acts['delete']['class'] = \app\components\SoftDeleteAction::class;
        }

        foreach ($acts as $key => $config) {
            if (method_exists($this, "action$key")) {
                unset($acts[$key]);
            }
        }

        return $acts;
    }

    /** @return \yii\data\ActiveDataProvider */
    protected function getDataProvider($modelClass = null)
    {
        return Yii::createObject([
            'class' => \yii\data\ActiveDataProvider::class,
            'query' => call_user_func([$modelClass ?: $this->modelClass, 'find']),
            'pagination' => [
                'defaultPageSize' => 10,
            ],
        ]);
    }
}
