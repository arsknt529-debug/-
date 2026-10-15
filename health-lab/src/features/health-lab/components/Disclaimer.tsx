import { commonCopy as C } from '../content/common';

/** ご利用の前に：要点を1行で見せ、詳しい説明は開いて読めるようにする */
export function Disclaimer() {
  return (
    <section className="hl-disclaimer" aria-label={C['common.disclaimer.title'].text}>
      <p className="hl-disclaimer-lead">{C['common.disclaimer.short'].text}</p>
      <details>
        <summary>{C['common.disclaimer.title'].text}</summary>
        <ul className="hl-list-dot">
          <li>{C['common.disclaimer.notDiagnosis'].text}</li>
          <li>{C['common.disclaimer.consult'].text}</li>
          <li>{C['common.disclaimer.followDoctor'].text}</li>
          <li>{C['common.disclaimer.emergency'].text}</li>
          <li>{C['common.privacy'].text}</li>
        </ul>
      </details>
    </section>
  );
}
