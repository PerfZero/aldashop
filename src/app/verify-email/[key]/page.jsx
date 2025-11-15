"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EmailVerificationModal from '../../../components/EmailVerificationModal';
import styles from './page.module.css';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const key = params?.key;

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <EmailVerificationModal 
        isOpen={isOpen} 
        onClose={handleClose}
        verificationKey={key}
      />
    </div>
  );
}

