import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { Link } from '@stackflow/link/future';
import { useFlow } from '@stackflow/react/future';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useAppScreenOptions } from '../platform';

export function LoginActivity() {
  const flow = useFlow();

  return (
    <Phase7Screen title="로그인" showBack={false}>
      <h1>당신의 작은 아이디어가 세상을 바꿉니다</h1>
      <p>YAPP+에 로그인하고 세션과 공지를 확인해 보세요.</p>
      <div className="spike-phase7-actions" aria-label="소셜 로그인">
        <button type="button" onClick={() => flow.push('LoginError', {}, { animate: false })}>
          구글로 계속하기
        </button>
        <button type="button" onClick={() => flow.push('Signup', {}, { animate: false })}>
          애플로 계속하기
        </button>
      </div>
    </Phase7Screen>
  );
}

export function LoginErrorActivity() {
  return (
    <Phase7Screen title="오류 안내">
      <h1>앗, 문제가 발생했어요!</h1>
      <p>운영진에게 문의하면 빠르게 해결할 수 있어요.</p>
      <a href="https://pf.kakao.com/_xkxmxjxd" target="_blank" rel="noopener noreferrer">
        운영진에게 문의하기
      </a>
    </Phase7Screen>
  );
}

export function SignupActivity() {
  const flow = useFlow();
  const [step, setStep] = useState<'name' | 'phone'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const value = step === 'name' ? name : phone;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }

    if (step === 'name') {
      setStep('phone');
      return;
    }

    flow.push('SignupStatus', {}, { animate: false });
  }

  return (
    <Phase7Screen title="회원가입" preventSwipeBack>
      <form className="spike-phase7-form" onSubmit={handleSubmit}>
        <h1>{step === 'name' ? '이름을 입력해 주세요' : '휴대폰 번호를 입력해 주세요'}</h1>
        <input
          aria-label={step === 'name' ? '이름' : '휴대폰 번호'}
          autoComplete={step === 'name' ? 'name' : 'tel-national'}
          inputMode={step === 'name' ? 'text' : 'tel'}
          type={step === 'name' ? 'text' : 'tel'}
          value={value}
          placeholder={
            step === 'name' ? '본인 이름을 입력해 주세요' : '휴대폰 번호를 입력해 주세요'
          }
          onChange={(event) =>
            step === 'name' ? setName(event.target.value) : setPhone(event.target.value)
          }
        />
        <button type="submit" disabled={!value.trim()}>
          다음
        </button>
      </form>
    </Phase7Screen>
  );
}

export function SignupStatusActivity() {
  return (
    <Phase7Screen title="가입 승인 상태">
      <h1>운영진 승인을 기다리고 있어요...</h1>
      <p>승인 완료까지 잠시만 기다려 주세요.</p>
    </Phase7Screen>
  );
}

export function SignupCompleteActivity() {
  return (
    <Phase7Screen title="가입 완료" showBack={false} preventSwipeBack>
      <h1>회원가입을 완료했어요!</h1>
      <p>YAPP의 새로운 멤버가 되신 걸 진심으로 환영해요.</p>
      <Link
        activityName="Tabs"
        activityParams={{ initialTab: 'home' }}
        data-testid="signup-home-link"
      >
        시작하기
      </Link>
    </Phase7Screen>
  );
}

export function SignupUnregisteredActivity() {
  return (
    <Phase7Screen title="미등록 회원 안내" showBack={false} preventSwipeBack>
      <h1>미등록 회원 안내</h1>
      <p>회원 확인 안내를 준비하고 있어요. 현재 회원 등록 여부는 표시되지 않아요.</p>
      <Link activityName="Login" activityParams={{}} data-testid="unregistered-login-link">
        로그인으로 돌아가기
      </Link>
    </Phase7Screen>
  );
}

export function DevRoutesActivity() {
  return (
    <Phase7Screen title="개발 경로">
      <h1>개발용 화면 경로</h1>
      <nav className="spike-phase7-route-list" aria-label="개발 경로 목록">
        <Link activityName="Login" activityParams={{}}>
          로그인
        </Link>
        <Link activityName="LoginError" activityParams={{}}>
          로그인 오류
        </Link>
        <Link activityName="Signup" activityParams={{}}>
          추가 정보 입력
        </Link>
        <Link activityName="SignupStatus" activityParams={{}}>
          가입 승인 상태
        </Link>
        <Link activityName="SignupComplete" activityParams={{}}>
          가입 완료
        </Link>
        <Link activityName="SignupUnregistered" activityParams={{}}>
          미등록 회원 안내
        </Link>
      </nav>
    </Phase7Screen>
  );
}

function Phase7Screen({
  children,
  preventSwipeBack,
  showBack = true,
  title,
}: {
  children: ReactNode;
  preventSwipeBack?: boolean;
  showBack?: boolean;
  title: string;
}) {
  const appScreenOptions = useAppScreenOptions();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | YAPP+`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <AppScreen {...appScreenOptions} preventSwipeBack={preventSwipeBack}>
      <AppScreenContent>
        <AppBar>
          {showBack ? <AppBarBackButton /> : null}
          <AppBarMain title={title} />
        </AppBar>
        <main className="spike-content spike-phase7-content">{children}</main>
      </AppScreenContent>
    </AppScreen>
  );
}
