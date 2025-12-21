'use client';

import { useStore } from '@/lib/store';
import { Shield, Target, TrendingUp, Users, Award } from 'lucide-react';

export default function AboutPage() {
  const { state } = useStore();
  const isEnglish = state.language === 'EN';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 gradient-text text-center">
          {isEnglish ? 'About AthleteXchange (ATHLX)' : 'Sobre AthleteXchange (ATHLX)'}
        </h1>

        {/* What is ATHLX - EN */}
        {isEnglish && (
          <section className="mb-16">
            <div className="glass-effect rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                <Award className="text-blue-400" size={32} />
                <span>About AthleteXchange (ATHLX)</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  AthleteXchange (ATHLX) is a pilot platform designed to explore new ways for fans to support athletes through a simulated, demo-only environment.
                </p>
                <p>
                  This pilot uses Demo Credits (tATHLX) and Athlete Units purely for testing user experience and support allocation logic. Nothing in this pilot represents real money, ownership rights, shares, or any promise of financial return. There are no withdrawals and no external transfers.
                </p>
                <p className="font-semibold text-lg mt-6 mb-4">How the pilot works:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Athletes can apply and are reviewed by an operator.</li>
                  <li>Approved athletes appear in the Athlete Directory.</li>
                  <li>Fans can acquire or release Athlete Units using demo credits inside the Test Environment.</li>
                  <li>A fixed demo fee model distributes demo credits into three ledgers:
                    <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                      <li>Operations Wallet (platform costs simulation)</li>
                      <li>Athlete Reward Wallet (demo-only allocation)</li>
                      <li>Post-Career Support Vault (locked demo ledger)</li>
                    </ul>
                  </li>
                </ul>
                <p className="font-semibold text-red-300 text-lg mt-6">
                  Important notice:
                </p>
                <p>
                  This is a closed pilot for UX testing and community research. Demo-only. No real-world money. No withdrawals. No external transfers. Nothing here represents real money or any real-world entitlement.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* What is ATHLX - ES */}
        {!isEnglish && (
          <section className="mb-16">
            <div className="glass-effect rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                <Award className="text-blue-400" size={32} />
                <span>Sobre AthleteXchange (ATHLX)</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  AthleteXchange (ATHLX) es un piloto diseñado para explorar nuevas formas de apoyo a atletas mediante un entorno simulado, solo para demostración.
                </p>
                <p>
                  Este piloto utiliza Créditos Demo (tATHLX) y Unidades del Atleta únicamente para probar la experiencia de usuario y la lógica de asignación de apoyo. Nada en este piloto representa dinero real, derechos de propiedad, acciones, ni promesas de retorno financiero. No hay retiros ni transferencias externas.
                </p>
                <p className="font-semibold text-lg mt-6 mb-4">Cómo funciona el piloto:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los atletas pueden solicitar y son revisados por un operador.</li>
                  <li>Los atletas aprobados aparecen en el Directorio de Atletas.</li>
                  <li>Los fans pueden adquirir o liberar Unidades del Atleta usando créditos demo dentro del Entorno de Prueba.</li>
                  <li>Un modelo fijo de comisión demo distribuye créditos demo en tres registros:
                    <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                      <li>Cartera de Operaciones (simulación de costes de la plataforma)</li>
                      <li>Cartera de Recompensas del Atleta (asignación solo demo)</li>
                      <li>Fondo de Apoyo Post-Carrera (registro demo bloqueado)</li>
                    </ul>
                  </li>
                </ul>
                <p className="font-semibold text-red-300 text-lg mt-6">
                  Aviso importante:
                </p>
                <p>
                  Este es un piloto cerrado para pruebas de UX y participación de la comunidad. No es un producto de inversión, no es una oferta de valores, ni un servicio financiero.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Purpose & Vision */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {isEnglish ? 'Purpose & Vision' : 'Propósito y Visión'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Target className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {isEnglish ? 'Support for Young Talents' : 'Apoyo a Jóvenes Talentos'}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {isEnglish 
                  ? 'This pilot explores direct support models for athletes during early career stages, when traditional funding is often unavailable.'
                  : 'Este piloto explora modelos de apoyo directo para atletas en etapas tempranas de su carrera, cuando el financiamiento tradicional suele ser inaccesible.'}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {isEnglish ? 'Post-Career Support Simulation' : 'Simulación de Apoyo Post-Carrera'}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {isEnglish 
                  ? 'The Post-Career Support Vault is a locked demo ledger concept designed to simulate long-term support mechanisms for athletes.'
                  : 'El Fondo de Apoyo Post-Carrera es un concepto de registro demo bloqueado diseñado para simular mecanismos de apoyo a largo plazo para atletas.'}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Users className="text-red-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {isEnglish ? 'Community Participation' : 'Participación Comunitaria'}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {isEnglish 
                  ? 'Fans participate in a closed test environment to help shape new community-driven athlete support models.'
                  : 'Los fans participan en un entorno de prueba cerrado para ayudar a dar forma a nuevos modelos de apoyo a atletas impulsados por la comunidad.'}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <TrendingUp className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {isEnglish ? 'UX Testing & Feedback' : 'Pruebas de UX y Retroalimentación'}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {isEnglish 
                  ? 'This closed pilot gathers user experience data and feedback to improve support allocation models and platform design.'
                  : 'Esto es un piloto cerrado para pruebas de UX e investigación comunitaria. Solo demostración. No es dinero real. No hay retiros. No hay transferencias externas. Nada aquí genera uso o efectos fuera del piloto.'}
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="glass-effect rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              {isEnglish ? 'Join the Pilot' : 'Únete al Piloto'}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {isEnglish 
                ? 'Participate in testing this closed demo environment.'
                : 'Participa en las pruebas de este entorno demo cerrado.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/market"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                {isEnglish ? 'Explore Test Environment' : 'Explorar Entorno de Prueba'}
              </a>
              <a
                href="/register-athlete"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                {isEnglish ? 'Register as Athlete' : 'Registrarse como Atleta'}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
