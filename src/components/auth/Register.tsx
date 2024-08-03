import React, { useState } from 'react';
import { FaTwitter } from 'react-icons/fa6';

import LoginButton from './LoginButton.tsx';
import { useColorMode } from '../../contexts/ColorMode.js';
import axios from 'axios';
import './styles.css'; // Import the custom styles

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

const config = {
  rpcUrl: 'https://mainnet.optimism.io',
  domain: 'example.com',
  siweUri: 'https://example.com/login',
};

export default function Register(props) {
  const { setCurrentLoginView, registerToTwitter, verifyAndSetUserProfile,
    setUser, closeAlertDialog, getOrCreateUserSession } = props;
  const { colorMode } = useColorMode();
  const formBgColor = colorMode === 'light' ? 'bg-neutral-50' : 'bg-neutral-900';
  const formTextColor = colorMode === 'light' ? 'text-neutral-900' : 'text-neutral-50';
  const [error, setError] = useState(null);
  const [isTermsChecked, setIsTermsChecked] = useState(true);

  const submitUserRegister = (evt) => {
    evt.preventDefault();
    if (!isTermsChecked) {
      setError('You must agree to the terms and conditions');
      return;
    }
    const email = evt.target.email.value;
    const password = evt.target.password.value;
    const confirmPassword = evt.target.confirmPassword.value;
    const username = evt.target.username.value;
    if (password !== confirmPassword) {
      setError('passwords do not match');
      return;
    }
    if (!email || !password || !username) {
      setError('All fields are required');
      return;
    }
    const payload = {
      email,
      password,
      username
    }
    axios.post(`${PROCESSOR_SERVER}/users/register`, payload).then(function (dataRes) {
      const userData = dataRes.data;
      const authToken = userData.authToken;
      localStorage.setItem('authToken', authToken);
      setUser(userData);
      closeAlertDialog();
      getOrCreateUserSession();
    }).catch(function (error) {
      console.log('error: ', error);
      setError('Unable to register user');
    });
  }

  const handleRegisterToTwitter = () => {
    if (!isTermsChecked) {
      alert('You must agree to the terms and conditions');
      return;
    }
    registerToTwitter();
  }

  return (
    <div>
      <div>
        <div className='mt-2 mb-4 text-center font-bold  '>
          Register with Email and password
        </div>

        <div>
          {error && <div className='text-red-500 text-center'>
            {error}
          </div>}
        </div>

        <div>
          <form onSubmit={submitUserRegister} className='w-[250px] m-auto'>
            <div className='form-group  '>
              <div className="text-xs text-left font-bold pl-1">
                User Name
              </div>
              <input type='text' name='username'
                className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-full
            ${formBgColor} ${formTextColor}`}
                placeholder='User Name' />
            </div>
            <div className='form-group'>
              <div className="text-xs text-left font-bold pl-1">
                Email
              </div>
              <input type='email' name='email'
                className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-full
            ${formBgColor} ${formTextColor}`}
                placeholder='email' />
            </div>
            <div>
              <div className="text-xs text-left font-bold pl-1">
                Password
              </div>
              <input type='password' name='password'
                className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-full
            ${formBgColor} ${formTextColor}`} placeholder='password' />
            </div>
            <div>
              <input type='password' name='confirmPassword'
                className={`form-control mb-2 mt-2
            rounded-lg p-1 pl-4 h-[45px] w-full
            ${formBgColor} ${formTextColor}`}
                placeholder='confirm password' />
            </div>
            <div className='mt-2 mb-8 text-center'>
              <div className="flex flex-row  m-auto text-sm text-left">
                <div className='basis-1/12'>
                  <input
                    type='checkbox'
                    name='terms'
                    className='custom-register-checkbox w-[30px] h-[30px]'
                    checked={isTermsChecked}
                    onChange={() => setIsTermsChecked(!isTermsChecked)}
                  />
                </div>
                <div className='basis-11/12'>
                  <div className='pl-2 mt-[-4px]'>
                    By registering you agree to our&nbsp;<a href="https://samsar.one/terms" target='_blank' className='underline'>terms</a>
                    &nbsp;and our&nbsp;<a href="https://samsar.one/privacy" target='_blank' className='underline'>privacy policy</a>.
                  </div>
                </div>
              </div>
            </div>
            <div>
              <LoginButton type="submit">
                Register
              </LoginButton>
            </div>
          </form>
        </div>
        <div>
          <div className='mt-4 mb-4 text-center font-bold'>
            Or register with a social provider
          </div>
        </div>
        <div className='flex flex-row text-center mb-4'>
          <div className='basis-full pl-4 pr-4'>
            <div className='bg-neutral-900 text-neutral-100 p-2 rounded-lg cursor-pointer h-[50px]
            text-center m-auto' onClick={handleRegisterToTwitter}>
              <div className='text-center text-lg font-bold pt-[2px]'>
                <FaTwitter className='inline-block mr-1' />
                <div className='inline-block'>
                  Twitter
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>
            <div className='mt-4 mb-4 text-center font-bold'>
              Already have an account?
            </div>
            <div className='text-center'>
              <LoginButton onClick={() => setCurrentLoginView('login')}>
                Login
              </LoginButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
