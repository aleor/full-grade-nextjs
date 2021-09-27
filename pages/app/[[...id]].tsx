import React, { FC, useState } from 'react';
import { Pane, Dialog, majorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';
import Logo from '../../components/logo';
import FolderList from '../../components/folderList';
import NewFolderButton from '../../components/newFolderButton';
import User from '../../components/user';
import FolderPane from '../../components/folderPane';
import DocPane from '../../components/docPane';
import NewFolderDialog from '../../components/newFolderDialog';
import { getSession, useSession } from 'next-auth/client';
import { folder, doc, connectToDB } from '../../db';

const App: FC<{ folders?: any[]; activeFolder?: any; activeDoc?: any; activeDocs?: any[] }> = ({
  folders,
  activeDoc,
  activeFolder,
  activeDocs,
}) => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [newFolderIsShown, setIsShown] = useState(false);

  if (loading) {
    return null;
  }

  const Page = () => {
    if (activeDoc) {
      return <DocPane folder={activeFolder} doc={activeDoc} />;
    }

    if (activeFolder) {
      return <FolderPane folder={activeFolder} docs={activeDocs} />;
    }

    return null;
  };

  if (!loading && !session) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    );
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={folders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page />
      </Pane>
      <NewFolderDialog close={() => setIsShown(false)} isShown={newFolderIsShown} onNewFolder={() => {}} />
    </Pane>
  );
};

App.defaultProps = {
  folders: [{ id: 'none', title: 'New folder' }],
};

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) {
    return {
      props: { session },
    };
  }

  const props: any = {};

  const { db } = await connectToDB();
  const folders = await folder.getFolders(db, session.user.id);

  // if params are '/app/folder' or '/app/folder/doc'
  if (ctx.params.id.length) {
    props.activeFolder = folders.find((f) => f.id === ctx.params.id[0]);
    props.activeDocs = await doc.getDocsByFolder(db, props.activeFolder._id);

    if (ctx.params.id.length > 1) {
      props.activeDoc = props.activeDocs.find((d) => d._id === ctx.params.id[2]);
    }
  }

  return {
    props,
  };
}

export default App;
