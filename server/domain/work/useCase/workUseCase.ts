import { LoadingWorkEntity } from 'api/@types/work';
import { transaction } from 'service/prismaClient';
import { workEvent } from '../event/workEvent';
import { workMethod } from '../model/workMethod';
import { novelQuery } from '../repository/novelQuery';
import { workCommand } from '../repository/workCommand';

export const workUseCase = {
  create: (novelUrl: string): Promise<LoadingWorkEntity> =>
    transaction('RepeatableRead', async (tx) => {
      const { title, author, html } = await novelQuery.scrape(novelUrl);
      const loadingWork = workMethod.create({ novelUrl, title, author });

      await workCommand.save(tx, loadingWork);

      workEvent.workCreated({ loadingWork, html });

      return loadingWork;
    }),
  complete: (loadingwork: LoadingWorkEntity, image: Buffer): Promise<void> =>
    transaction('RepeatableRead', async (tx) => {
      const completeWork = workMethod.complete(loadingwork);

      await workCommand.save(tx, completeWork);
    }),
};
