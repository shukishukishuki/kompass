export async function generateMetadata() {
  return { title: "利用規約" };
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-gray-800">
      <h1 className="mb-8 text-2xl font-bold">利用規約</h1>
      <p className="mb-6 text-sm text-gray-500">最終更新日：2026年4月</p>
      <p className="mb-8 text-sm leading-relaxed">
        この利用規約（以下，「本規約」といいます。）は，Kompass運営事務局（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
      </p>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第1条（適用）</h2>
        <p className="text-sm leading-relaxed">
          本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
        </p>
        <p className="text-sm leading-relaxed">
          当社は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
        </p>
        <p className="text-sm leading-relaxed">
          本規約の規定が前条の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第2条（利用登録）</h2>
        <p className="text-sm leading-relaxed">
          本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。
        </p>
        <p className="text-sm leading-relaxed">
          当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
          <li>本規約に違反したことがある者からの申請である場合</li>
          <li>その他，当社が利用登録を相当でないと判断した場合</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第3条（ユーザーIDおよびパスワードの管理）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは，自己の責任において，本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
        </p>
        <p className="text-sm leading-relaxed">
          ユーザーは，いかなる場合にも，ユーザーIDおよびパスワードを第三者に譲渡または貸与し，もしくは第三者と共用することはできません。当社は，ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には，そのユーザーIDを登録しているユーザー自身による利用とみなします。
        </p>
        <p className="text-sm leading-relaxed">
          ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は，当社に故意又は重大な過失がある場合を除き，当社は一切の責任を負わないものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第4条（利用料金）</h2>
        <p className="text-sm leading-relaxed">
          本サービスは現在無料で提供しています。有料プランを導入する場合は，事前にユーザーへ通知します。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第5条（禁止事項）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは以下の行為を行ってはなりません。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
          <li>当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
          <li>本サービスによって得られた情報を商業的に利用する行為</li>
          <li>当社のサービスの運営を妨害するおそれのある行為</li>
          <li>不正アクセスをし，またはこれを試みる行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>不正な目的を持って本サービスを利用する行為</li>
          <li>本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為</li>
          <li>当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為</li>
          <li>その他，当社が不適切と判断する行為</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第6条（本サービスの提供の停止等）</h2>
        <p className="text-sm leading-relaxed">
          当社は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
          <li>地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合</li>
          <li>コンピュータまたは通信回線等が事故により停止した場合</li>
          <li>その他，当社が本サービスの提供が困難と判断した場合</li>
        </ul>
        <p className="text-sm leading-relaxed">
          当社は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害についても，一切の責任を負わないものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第7条（利用制限および登録抹消）</h2>
        <p className="text-sm leading-relaxed">
          当社は，ユーザーが以下のいずれかに該当する場合には，事前の通知なく，ユーザーに対して，本サービスの全部もしくは一部の利用を制限し，またはユーザーとしての登録を抹消することができるものとします。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>本規約のいずれかの条項に違反した場合</li>
          <li>登録事項に虚偽の事実があることが判明した場合</li>
          <li>その他，当社が本サービスの利用を適当でないと判断した場合</li>
        </ul>
        <p className="text-sm leading-relaxed">
          当社は，本条に基づき当社が行った行為によりユーザーに生じた損害について，一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第8条（退会）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは，当社の定める退会手続により，本サービスから退会できるものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第9条（保証の否認および免責事項）</h2>
        <p className="text-sm leading-relaxed">
          当社は，本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。
        </p>
        <p className="text-sm leading-relaxed">
          当社は，本サービスに起因してユーザーに生じたあらゆる損害について，当社の故意又は重過失による場合を除き，一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第10条（サービス内容の変更等）</h2>
        <p className="text-sm leading-relaxed">
          当社は，ユーザーへの事前の告知をもって，本サービスの内容を変更，追加または廃止することがあり，ユーザーはこれを承諾するものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第11条（利用規約の変更）</h2>
        <p className="text-sm leading-relaxed">
          当社は以下の場合には，ユーザーの個別の同意を要せず，本規約を変更することができるものとします。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>本規約の変更がユーザーの一般の利益に適合するとき。</li>
          <li>本規約の変更が本サービス利用契約の目的に反せず，かつ，変更の必要性，変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。</li>
        </ul>
        <p className="text-sm leading-relaxed">
          当社はユーザーに対し，前項による本規約の変更にあたり，事前に，本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第12条（個人情報の取扱い）</h2>
        <p className="text-sm leading-relaxed">
          当社は，本サービスの利用によって取得する個人情報については，当社「プライバシーポリシー」に従い適切に取り扱うものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第13条（通知または連絡）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーと当社との間の通知または連絡は，当社の定める方法によって行うものとします。
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-bold">第14条（権利義務の譲渡の禁止）</h2>
        <p className="text-sm leading-relaxed">
          ユーザーは，当社の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">第15条（準拠法・裁判管轄）</h2>
        <p className="text-sm leading-relaxed">
          本規約の解釈にあたっては，日本法を準拠法とします。
        </p>
        <p className="text-sm leading-relaxed">
          本サービスに関して紛争が生じた場合には，当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
        </p>
      </section>

      <p className="mt-8 text-sm leading-relaxed">以上</p>
    </main>
  );
}
