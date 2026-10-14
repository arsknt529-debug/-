import { commonCopy as C } from '../content/common';

/** ご利用の前に（全機能のトップで表示する簡潔な説明） */
export function Disclaimer() {
  return (
    <section className="hl-note" aria-labelledby="hl-disclaimer">
      <strong id="hl-disclaimer">{C['common.disclaimer.title'].text}</strong>
      <ul className="hl-list-dot">
        <li>{C['common.disclaimer.notDiagnosis'].text}</li>
        <li>{C['common.disclaimer.consult'].text}</li>
        <li>{C['common.disclaimer.followDoctor'].text}</li>
        <li>{C['common.disclaimer.emergency'].text}</li>
        <li>{C['common.privacy'].text}</li>
      </ul>
    </section>
  );
}
