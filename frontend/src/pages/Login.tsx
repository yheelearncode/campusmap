import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, gradients, spacing, borderRadius, shadows, typography, commonStyles } from '../styles/design-tokens';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    language: 'ko',
    role: ''
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // 로그인
      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
          localStorage.setItem('userRole', data.userRole);
          localStorage.setItem('language', data.language || 'ko');
          alert('로그인 성공!');
          navigate('/map');
        } else {
          alert(data.error || '로그인 실패');
        }
      } catch (error) {
        console.error('로그인 에러:', error);
        alert('서버 연결에 실패했습니다.');
      }
    } else {
      // 회원가입
      if (form.password !== form.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      try {
        const res = await fetch('/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            username: form.name,
            language: form.language,
            role: form.role
          })
        });

        const data = await res.json();

        if (res.ok) {
          alert('회원가입 성공! 로그인해주세요.');
          setIsLogin(true);
          setForm({ email: '', password: '', name: '', language: '', confirmPassword: '', role: '' });
        } else {
          alert(data.error || '회원가입 실패');
        }
      } catch (error) {
        console.error('회원가입 에러:', error);
        alert('서버 연결에 실패했습니다.');
      }
    }
  };

  const labelStyle = {
    display: 'block',
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  };

  const inputStyle = {
    ...commonStyles.input,
    fontSize: typography.fontSize.sm,
  };

  const formGroupStyle = {
    marginBottom: spacing.lg,
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: gradients.primary
    }}>
      <div style={{
        background: colors.white,
        padding: spacing.huge,
        borderRadius: borderRadius.xl,
        boxShadow: shadows.lg,
        minWidth: '400px',
        maxWidth: '450px'
      }}>
        <h2 style={{
          margin: `0 0 ${spacing.xxl} 0`,
          fontSize: typography.fontSize.xxxl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          textAlign: 'center'
        }}>
          {isLogin ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                required={!isLogin}
                style={inputStyle}
              />
            </div>
          )}

          {!isLogin && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>사용자 역할</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required={!isLogin}
                style={inputStyle}
              >
                <option value="" disabled>역할을 선택하세요 *</option>
                <option value="USER">일반 사용자</option>
                <option value="STAFF">스태프</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>
          )}

          {!isLogin && (
            <div style={formGroupStyle}>
              <label style={labelStyle}>언어</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                required={!isLogin}
                style={inputStyle}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="mn">Монгол</option>
              </select>
            </div>
          )}

          <div style={formGroupStyle}>
            <label style={labelStyle}>이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              style={inputStyle}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: spacing.xxl }}>
              <label style={labelStyle}>비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required={!isLogin}
                style={inputStyle}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              ...commonStyles.button.primary,
              width: '100%',
              padding: `${spacing.md} 0`,
              marginBottom: spacing.lg,
            }}
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary
        }}>
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setForm({ email: '', password: '', name: '', confirmPassword: '', role: '', language: '' });
            }}
            style={{
              marginLeft: spacing.sm,
              background: 'none',
              border: 'none',
              color: colors.primary,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
            }}
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}