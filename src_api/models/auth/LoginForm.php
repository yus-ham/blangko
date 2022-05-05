<?php
namespace app\models\auth;

use Yii;
use yii\base\Model;

/**
 * LoginForm is the model behind the login form.
 *
 * @property User|null $user This property is read-only.
 *
 */
class LoginForm extends Model
{
    public $username;
    public $password;
    public $email;
    public $rememberMe = true;

    private $_rt;
    private $_user = false;

    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            ['username', 'trim'],
            // username and password are both required
            [['username', 'password'], 'required'],
            // rememberMe must be a boolean value
            ['rememberMe', 'boolean'],
            // password is validated by validatePassword()
            ['password', 'validatePassword'],
        ];
    }

    public function login()
    {
        return $this->validate() && $this->createRefreshToken();
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     * @param string $attribute the attribute currently being validated
     * @param array $params the additional name-value pairs given in the rule
     */
    public function validatePassword($attribute, $params)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Periksa lagi username atau password yang anda masukkan.');
            }
        }
    }

    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    public function getUser() { 
        if ($this->_user === false) {
            $this->_user = User::find()
                ->where(['username' => $this->username])
                ->andWhere("deleted_at is null")
                ->one();
        }
        return $this->_user;
    }

    public function fields()
    {
        return [
            'identity' => fn() => $this->user,
            'token' => fn() => $this->token,
            'refresh_token' => fn() => $this->refreshToken->value,
        ];
    }
    
    public function getToken()
    {
        return $this->user->jwt;
    }

    public function getRefreshToken()
    {
        if (!$this->_rt) {
            $this->createRefreshToken();
        }

        return $this->_rt;
    }

    public function createRefreshToken()
    {
        $data = [
            'user_ip' => Yii::$app->request->userIP,
            'user_id' => $this->user->id,
        ];

        $this->_rt = RefreshToken::findOne($data);
            
        if (!$this->_rt) {
            $this->_rt = new self($data);
        }

        $this->_rt->value = Yii::$app->security->generateRandomString();
        $this->_rt->save(false);
    
        return $this->_rt;
    }
}
