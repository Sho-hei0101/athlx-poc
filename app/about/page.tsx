'use client';

import { Shield, Target, TrendingUp, Users, DollarSign, Award, Scale } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 gradient-text text-center">
          About AthleteXchange
        </h1>

        {/* What is ATHLX */}
        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Award className="text-blue-400" size={32} />
              <span>What is AthleteXchange (ATHLX)?</span>
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                AthleteXchange is a revolutionary digital platform where fans and investors
                can directly support individual athletes by trading athlete tokens. Unlike
                traditional sports investment models that focus solely on clubs and
                franchises, ATHLX creates a new asset class that links real sports
                performance with financial markets at the individual athlete level.
              </p>
              <p>
                Each athlete listed on our platform receives their own unique token that
                represents their career growth and potential. When fans trade these tokens,
                they&apos;re not just speculating on price movements—they&apos;re actively
                contributing to the athlete&apos;s immediate financial needs and long-term
                retirement security.
              </p>
              <p className="font-semibold text-blue-300 text-lg">
                &quot;Support becomes investment, and investment becomes lifelong protection
                for athletes.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Purpose & Vision */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Purpose &amp; Vision</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Target className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">Support for Young Talents</h3>
              <p className="text-gray-300 leading-relaxed">
                Too many talented young athletes are forced to abandon their dreams due to
                financial constraints. Training costs, equipment, travel to competitions,
                and coaching fees create insurmountable barriers. ATHLX provides direct
                funding during these critical early years, allowing athletes to focus
                entirely on developing their skills and reaching their full potential.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">Retirement Stability for Athletes</h3>
              <p className="text-gray-300 leading-relaxed">
                Athletic careers are notoriously short and uncertain. Many professional
                athletes face severe economic hardship after retirement, despite years of
                dedication and sacrifice. The Athlete Lifetime Support Vault accumulates
                funds from every trade, creating a safety net that transforms active
                playing years into lasting financial security and dignity in retirement.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Users className="text-red-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                Direct Support from Fans to Players
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Currently, fans have no transparent, direct method to financially support
                individual athletes. Money flows through complex intermediaries—clubs,
                leagues, sponsors—with minimal direct benefit to the players themselves.
                ATHLX creates an immediate, transparent connection where fan investment
                translates directly into athlete support, strengthening the emotional and
                financial bond between supporters and the athletes they admire.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <TrendingUp className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                New Fans and Investors Entering Sports
              </h3>
              <p className="text-gray-300 leading-relaxed">
                ATHLX opens sports to an entirely new audience: investors who believe in
                individual talent and want exposure to athlete growth as an asset class.
                This innovative market attracts capital from beyond traditional sports
                fans, expanding the financial ecosystem around athletes while creating
                genuine opportunities for social impact alongside potential financial
                returns.
              </p>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <TrendingUp className="text-green-400" size={32} />
              <span>Market Opportunity</span>
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The global sports industry is valued at over $500 billion annually, yet
                individual athlete investment remains largely untapped. Traditional funding
                models favor established stars and major clubs, leaving thousands of
                talented athletes struggling for support.
              </p>
              <p>
                Athletic careers are inherently high-risk ventures. Young athletes invest
                years of their lives training with uncertain financial outcomes. Many
                Olympic and professional sports athletes compete at the highest levels yet
                earn modest incomes, with few opportunities for sustainable wealth
                creation.
              </p>
              <p>
                ATHLX transforms this dynamic by creating liquid, tradeable markets around
                individual athletes. This &quot;sports investment&quot; model can
                dramatically expand the fan base, increase athlete liquidity, and provide
                new revenue streams that benefit players at all levels—from promising
                amateurs to established professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Token Economy */}
        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <DollarSign className="text-yellow-400" size={32} />
              <span>ATHLX Token Economy</span>
            </h2>

            <div className="space-y-6 text-gray-300 leading-relaxed mb-8">
              <p>
                <span className="font-bold text-blue-300">ATHLX</span> is the platform&apos;s
                native token and serves as the base currency for all athlete token
                transactions. When fans and investors trade athlete tokens, they use ATHLX
                to buy and sell positions.
              </p>
              <p>
                <span className="font-bold text-purple-300">Athlete Tokens</span> represent
                individual players. Each token reflects that athlete&apos;s career growth,
                performance, and market perception. As an athlete&apos;s career
                progresses—moving from amateur to semi-pro to professional to
                elite—their token value typically reflects these achievements.
              </p>
            </div>

            {/* Updated 5% Fee Structure */}
            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">
                Trading Fee Structure (5% per transaction)
              </h3>

              <div className="space-y-3">
                {/* 3% Platform Operations & Ecosystem */}
                <div className="flex items-start space-x-3">
                  <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold">3%</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Platform Operations &amp; Ecosystem</h4>
                    <p className="text-sm text-gray-400">
                      Covers core platform operations, security, legal &amp; compliance,
                      product development, and marketing. This share keeps ATHLX sustainable
                      and allows the ecosystem to grow over time.
                    </p>
                  </div>
                </div>

                {/* 1% Direct Athlete Reward */}
                <div className="flex items-start space-x-3">
                  <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold">1%</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Direct Athlete Reward</h4>
                    <p className="text-sm text-gray-400">
                      Paid directly to the athlete every time their token is traded. This
                      creates an instant, performance-linked income stream that helps cover
                      training costs, living expenses, and competition fees.
                    </p>
                  </div>
                </div>

                {/* 1% Lifetime Support Vault (Pension) */}
                <div className="flex items-start space-x-3">
                  <div className="w-20 h-20 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold">1%</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Lifetime Support Vault (Pension)</h4>
                    <p className="text-sm text-gray-400">
                      Allocated to a long-term vault dedicated to post-career support for
                      athletes. As trading volume accumulates over the years, this pool
                      grows into a pension-style safety net for life after retirement.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-400">
                This 5% fee structure aligns incentives between the platform and athletes:
                <strong> 3%</strong> sustains operations and ecosystem growth,
                <strong> 1%</strong> is paid out immediately to athletes on every trade, and
                <strong> 1%</strong> is reserved in a pension-style vault for their
                long-term security.
              </p>
            </div>
          </div>
        </section>

        {/* Athlete Lifetime Support Vault */}
        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Shield className="text-purple-400" size={32} />
              <span>Athlete Lifetime Support Vault</span>
            </h2>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                The Athlete Lifetime Support Vault is a cornerstone of ATHLX&apos;s mission
                to provide long-term financial stability for athletes. A portion of every
                trading fee is automatically deposited into this vault, accumulating over
                time.
              </p>
              <p>
                Retirement rewards are calculated based on years of active participation in
                the platform and total trading volume generated by the athlete&apos;s token.
                Athletes who contribute more to the ecosystem—through performance, fan
                engagement, and market activity—accumulate larger retirement benefits.
              </p>
              <p>
                This mechanism transforms the intense, short-lived effort of an athletic
                career into sustained financial support that extends far beyond their
                competitive years. It addresses one of sports&apos; most persistent
                problems: the abrupt financial cliff many athletes face after retirement.
              </p>
              <p className="font-semibold text-purple-300">
                The vault represents our core belief: athletes who dedicate their lives to
                sports deserve financial dignity not just during their careers, but for
                life.
              </p>
            </div>
          </div>
        </section>

        {/* Governance & Compliance */}
        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Scale className="text-blue-400" size={32} />
              <span>Governance &amp; Compliance</span>
            </h2>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                ATHLX is committed to operating within regulatory frameworks, with a
                particular focus on compliance with European cryptocurrency regulations
                (MiCA - Markets in Crypto-Assets). We believe that transparent, regulated
                operations are essential for building trust with athletes, fans, and
                investors.
              </p>
              <p>
                Our future roadmap includes implementing transparent smart contract
                governance systems, conducting regular third-party audits, and establishing
                clear protocols for athlete protection and privacy. We recognize that young
                athletes, in particular, require additional safeguards and responsible
                platform management.
              </p>
              <p>
                While athlete tokens represent market interest and career potential, they
                are designed to comply with securities regulations. Our legal structure
                ensures that athlete tokens function within appropriate regulatory
                boundaries while still providing meaningful financial support to players.
              </p>
              <p className="font-semibold text-blue-300">
                Transparency, accountability, and athlete protection are not optional
                features—they are fundamental to ATHLX&apos;s identity and mission.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="glass-effect rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-xl text-gray-300 mb-8">
              Be part of the revolution in athlete support and sports investment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/market"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                Explore Market
              </a>
              <a
                href="/register-athlete"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                Register as Athlete
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
