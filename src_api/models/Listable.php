<?php

namespace app\models;

trait Listable
{
    public function getAsOptions($labelAttr = 'name', $cond = null)
    {
        return \yii\helpers\ArrayHelper::map(self::find()->select('id,'. $labelAttr)->andWhere($cond)->all(), 'id', $labelAttr);
    }
}
