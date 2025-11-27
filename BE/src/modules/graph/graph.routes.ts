import { BaseRoute } from '../base/BaseRoute';
import { GraphController } from './graph.controller';

export class GraphRoute extends BaseRoute {
  protected initializeRoutes(): void {
    const controller = new GraphController();
    
    this.router.get('/graph', (req, res) => controller.getGraph(req, res));
    this.router.post('/graph', (req, res) => controller.saveGraph(req, res));
  }
}

