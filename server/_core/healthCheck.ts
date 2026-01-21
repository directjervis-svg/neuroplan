/**
 * Health Check Endpoint
 * 
 * Monitora a saúde do servidor e do banco de dados.
 * Usado pelo Manus para auto-healing e monitoramento contínuo.
 */

import { Router } from "express";
import { getDb } from "../db";

export const healthCheckRouter = Router();

/**
 * GET /health
 * Retorna o status do servidor e da conexão com o banco de dados
 */
healthCheckRouter.get("/health", async (req, res) => {
  try {
    const db = await getDb();
    
    if (!db) {
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        reason: "Database connection failed",
      });
    }

    // Test database connection
    await db.execute("SELECT 1");

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "2.0.0",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      reason: String(error),
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe - verifica se o servidor está pronto para receber tráfego
 */
healthCheckRouter.get("/health/ready", async (req, res) => {
  try {
    const db = await getDb();
    
    if (!db) {
      return res.status(503).json({ ready: false });
    }

    return res.status(200).json({ ready: true });
  } catch (error) {
    return res.status(503).json({ ready: false });
  }
});

/**
 * GET /health/live
 * Liveness probe - verifica se o servidor está vivo
 */
healthCheckRouter.get("/health/live", (req, res) => {
  res.status(200).json({ alive: true });
});
