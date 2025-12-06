import { Layout } from 'antd';
import { GithubOutlined, TwitterOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">AI工具大全</h3>
            <p className="text-gray-600 text-sm">
              发现和使用最好的AI工具，提供分类展示、智能排名、使用案例。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600">
                  排名标准
                </Link>
              </li>
              <li>
                <Link href="/use-cases" className="text-gray-600 hover:text-blue-600">
                  使用案例
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">热门分类</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/language" className="text-gray-600 hover:text-blue-600">
                  语言类工具
                </Link>
              </li>
              <li>
                <Link href="/category/image" className="text-gray-600 hover:text-blue-600">
                  画图类工具
                </Link>
              </li>
              <li>
                <Link href="/category/code" className="text-gray-600 hover:text-blue-600">
                  编程类工具
                </Link>
              </li>
              <li>
                <Link href="/category/video" className="text-gray-600 hover:text-blue-600">
                  视频类工具
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">联系我们</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 text-xl"
              >
                <GithubOutlined />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 text-xl"
              >
                <TwitterOutlined />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-gray-600 hover:text-blue-600 text-xl"
              >
                <MailOutlined />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 pb-4 text-center text-sm text-gray-600">
          <p>© {currentYear} AI工具大全. All rights reserved.</p>
        </div>
      </div>
    </AntFooter>
  );
}
