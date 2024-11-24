import React from 'react';
import { Layout } from 'antd';

const { Header } = Layout;

function Navbar() {
  return (
    <Header className="bg-gradient-to-r from-blue-500 to-purple-600 p-0 flex items-center justify-between w-full h-16 fixed top-0 z-50">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold ml-28 text-white">CurosAI</h1>
      </div>
    </Header>
  );
}

export default Navbar;
