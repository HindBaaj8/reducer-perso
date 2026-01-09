import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '../features/Helpers';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { capitalInitial, resultat } = useSelector(state => state.capitaux || { capitalInitial: 100000, resultat: 0 });
  const { caisse, banque, clients } = useSelector(state => state.actifs || { caisse: 50000, banque: 150000, clients: 80000 });
  const { fournisseurs, dettes, tvaAPayer } = useSelector(state => state.passifs || { fournisseurs: 45000, dettes: 30000, tvaAPayer: 8000 });
  const charges = useSelector(state => state.charges?.items || []);
  const produits = useSelector(state => state.produits?.items || []);

  // Calculs
  const totalActifs = caisse + banque + clients;
  const totalPassifs = fournisseurs + dettes + tvaAPayer;
  const totalCharges = charges.reduce((sum, item) => sum + parseFloat(item.montant || 0), 0);
  const totalProduits = produits.reduce((sum, item) => sum + parseFloat(item.montant || 0), 0);
  const resultatCalcule = totalProduits - totalCharges;

  // Données pour graphique Pie - Distribution des charges
  const chargesParCategorie = useMemo(() => {
    const categories = {};
    charges.forEach(charge => {
      const cat = charge.categorie || 'Autre';
      categories[cat] = (categories[cat] || 0) + parseFloat(charge.montant || 0);
    });
    return categories;
  }, [charges]);

  const pieData = {
    labels: Object.keys(chargesParCategorie),
    datasets: [{
      label: 'Charges par catégorie',
      data: Object.values(chargesParCategorie),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2,
    }],
  };

  // Données pour graphique Bar
  const barData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Produits',
        data: [totalProduits * 0.8, totalProduits * 0.9, totalProduits, totalProduits * 1.1, totalProduits * 0.95, totalProduits * 1.05],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Charges',
        data: [totalCharges * 0.85, totalCharges * 0.92, totalCharges, totalCharges * 1.05, totalCharges * 0.98, totalCharges * 1.02],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  };

  // Données pour graphique Line
  const lineData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [{
      label: 'Solde Total',
      data: [totalActifs * 0.7, totalActifs * 0.8, totalActifs * 0.9, totalActifs * 0.95, totalActifs * 0.97, totalActifs],
      borderColor: 'rgb(41, 128, 185)',
      backgroundColor: 'rgba(41, 128, 185, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Tableau de Bord</h2>
        <p>Vue d'ensemble de votre comptabilité</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card success">
          <div className="kpi-label">
            <TrendingUp size={20} />
            Total Revenus
          </div>
          <div className="kpi-value">{formatCurrency(totalProduits)}</div>
        </div>

        <div className="kpi-card danger">
          <div className="kpi-label">
            <TrendingDown size={20} />
            Total Dépenses
          </div>
          <div className="kpi-value">{formatCurrency(totalCharges)}</div>
        </div>

        <div className={`kpi-card ${resultatCalcule >= 0 ? 'success' : 'danger'}`}>
          <div className="kpi-label">
            <DollarSign size={20} />
            Résultat
          </div>
          <div className="kpi-value">{formatCurrency(resultatCalcule)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <Wallet size={20} />
            Capital Total
          </div>
          <div className="kpi-value">{formatCurrency(capitalInitial + resultatCalcule)}</div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-label">
            <CreditCard size={20} />
            Actifs Totaux
          </div>
          <div className="kpi-value">{formatCurrency(totalActifs)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">
            <AlertCircle size={20} />
            Passifs Totaux
          </div>
          <div className="kpi-value">{formatCurrency(totalPassifs)}</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Distribution des Charges</h3>
          {charges.length > 0 ? (
            <Pie data={pieData} options={chartOptions} />
          ) : (
            <div className="empty-state">
              <p>Aucune charge enregistrée</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Revenus vs Dépenses Mensuelles</h3>
          <Bar data={barData} options={chartOptions} />
        </div>

        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3>Évolution du Solde</h3>
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>

      {/* Détails des Comptes */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">💰 Caisse</div>
          <div className="kpi-value">{formatCurrency(caisse)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">🏦 Banque</div>
          <div className="kpi-value">{formatCurrency(banque)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">👥 Clients</div>
          <div className="kpi-value">{formatCurrency(clients)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">📦 Fournisseurs</div>
          <div className="kpi-value">{formatCurrency(fournisseurs)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">💳 Dettes</div>
          <div className="kpi-value">{formatCurrency(dettes)}</div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-label">📋 TVA à payer</div>
          <div className="kpi-value">{formatCurrency(tvaAPayer)}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;