import { type Request, type Response } from 'express';
import { BaseController } from '../base/BaseController';
import { db } from '../../config/db';
import { nodes, links, transactions } from '../../models/schema';
import { log } from '../../utils/logger';
import { notInArray, desc } from 'drizzle-orm';

export class GraphController extends BaseController {
  public async getGraph(req: Request, res: Response) {
    try {
      const allNodes = await db.select().from(nodes);
      const allLinks = await db.select().from(links);

      return this.ok(res, {
        nodes: allNodes.map(n => ({ id: n.id, val: 1, ...(n.data as object) })),
        links: allLinks.map(l => ({ source: l.source, target: l.target })),
      });
    } catch (error) {
      log('error', req.requestId, 'Failed to fetch graph', { error });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async getLedger(req: Request, res: Response) {
    try {
      const allTransactions = await db.select()
        .from(transactions)
        .orderBy(desc(transactions.createdAt));

      return this.ok(res, { transactions: allTransactions });
    } catch (error) {
      log('error', req.requestId, 'Failed to fetch ledger', { error });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async recordTransaction(req: Request, res: Response) {
    try {
      const { from, to, amount } = req.body;

      if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await db.transaction(async (tx) => {
        // 1. Record the transaction
        const dummyHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
        await tx.insert(transactions).values({
          from,
          to,
          amount,
          hash: dummyHash,
        });

        // 2. Ensure a link exists 
        await tx.insert(links).values({
          source: from,
          target: to,
        }).onConflictDoNothing();
      });

      log('info', req.requestId, 'Transaction recorded', { from, to, amount });
      return this.ok(res, { success: true });
    } catch (error) {
      log('error', req.requestId, 'Failed to record transaction', { error });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async saveGraph(req: Request, res: Response) {
    try {
      const { nodes: newNodes, links: newLinks } = req.body;

      await db.transaction(async (tx) => {
        // 1. Sync Nodes (Delete missing + Upsert)
        if (!newNodes || newNodes.length === 0) {
          await tx.delete(links); // Clear links first
          await tx.delete(nodes); // Clear all nodes
        } else {
          // Delete nodes not in the new list
          const keepIds = newNodes.map((n: any) => n.id);
          await tx.delete(nodes).where(notInArray(nodes.id, keepIds));
          
          // Upsert current nodes
          await tx.insert(nodes)
            .values(newNodes.map((n: any) => ({ id: n.id, data: { img: n.img } })))
            .onConflictDoNothing();
        }


        await tx.delete(links);
        
        if (newLinks && newLinks.length > 0) {
          // Ensure source/target are strings (graph library might send objects)
          const safeLinks = newLinks.map((l: any) => ({
            source: typeof l.source === 'object' ? l.source.id : l.source,
            target: typeof l.target === 'object' ? l.target.id : l.target,
          }));
          await tx.insert(links).values(safeLinks);
        }
      });

      log('info', req.requestId, 'Graph saved successfully', { nodeCount: newNodes?.length, linkCount: newLinks?.length });
      return this.ok(res, { success: true });
    } catch (error) {
      log('error', req.requestId, 'Failed to save graph', { error });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public execute(req: Request, res: Response): Promise<void | any> {
    // Not used for multi-method controller, but required by abstract class
    return Promise.resolve(); 
  }
}

