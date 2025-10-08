import { forwardRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './PassportCard.css';

const PassportCard = (
  {
    profile,
    mission,
    onLaunch,
    onDownload,
    isDownloading,
    downloadFeedback,
    hideActions = false,
    launchLabel = 'Initiate Journey Sequence',
  },
  ref
) => {
  const { name, dob, ageIn2050, passportId } = profile;

  const qrValue = useMemo(
    () => JSON.stringify({ passportId, name, dob }),
    [passportId, name, dob]
  );

  return (
    <div className="passport-card" ref={ref}>
      <header className="passport-header">
        <span>Future Access Passport</span>
        <strong>TerraVision 2050 Mission Control</strong>
      </header>

      <div className="passport-id">
        <span>Passport ID</span>
        <strong>{passportId}</strong>
      </div>

      <section className="passport-grid">
        <div>
          <span>CITIZEN</span>
          <p>{name}</p>
        </div>
        <div>
          <span>DATE OF ORIGIN</span>
          <p>{dob}</p>
        </div>
        <div>
          <span>AGE IN 2050</span>
          <p>{ageIn2050}</p>
        </div>
        <div>
          <span>MISSION TRACK</span>
          <p>{mission.title}</p>
        </div>
      </section>

      <div className="passport-qr">
        <QRCodeSVG value={qrValue} size={132} includeMargin fgColor="#47fff1" bgColor="transparent" />
        <span>Scan to verify</span>
      </div>

      <footer className="passport-footer">
        <p>{mission.brief}</p>
        {!hideActions ? (
          <>
            <div className="passport-actions">
              <button type="button" className="cta launch" onClick={onLaunch}>
                {launchLabel}
              </button>

              <button type="button" className="cta secondary" onClick={onDownload} disabled={isDownloading}>
                {isDownloading ? 'Preparing Passport…' : 'Download Passport'}
              </button>
            </div>
            {downloadFeedback ? <span className="download-feedback">{downloadFeedback}</span> : null}
          </>
        ) : null}
      </footer>
    </div>
  );
};

export default forwardRef(PassportCard);