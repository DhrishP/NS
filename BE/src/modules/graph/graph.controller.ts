import { type Request, type Response } from 'express';
import { BaseController } from '../base/BaseController';
import { db } from '../../config/db';
import { nodes, links } from '../../models/schema';
import { log } from '../../utils/logger';

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

  public async saveGraph(req: Request, res: Response) {
    try {
      const { nodes: newNodes, links: newLinks } = req.body;

      await db.transaction(async (tx) => {
        // 1. Upsert Nodes
        if (newNodes && newNodes.length > 0) {
          await tx.insert(nodes)
            .values(newNodes.map((n: any) => ({ id: n.id, data: { img: n.img } })))
            .onConflictDoNothing();
        }

        // 2. Sync Links (Delete All + Insert)
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

