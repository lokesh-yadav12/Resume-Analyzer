import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  Skeleton,
  useToast
} from '../components/common';
import { 
  fadeInUp, 
  staggerContainer, 
  staggerItem,
  hoverLift,
  scaleIn
} from '../utils/animations';

const DesignSystemDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const showToast = (type) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'Please review your information.',
      info: 'Here is some helpful information.'
    };
    toast[type](messages[type]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          {...fadeInUp}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Design System Components
          </h1>
          <p className="text-xl text-gray-600">
            A showcase of all available UI components and design patterns
          </p>
        </motion.div>

        {/* Buttons Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Buttons</Card.Title>
              <Card.Description>
                Various button styles and sizes for different use cases
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                {/* Button Variants */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">States</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button icon={<Star className="w-4 h-4" />}>With Icon</Button>
                    <Button icon={<Heart className="w-4 h-4" />} iconPosition="right">
                      Icon Right
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.section>

        {/* Cards Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <Card.Header>
                <Card.Title>Default Card</Card.Title>
                <Card.Description>Standard card with border</Card.Description>
              </Card.Header>
              <Card.Body>
                <p className="text-gray-600">
                  This is a default card with standard styling and border.
                </p>
              </Card.Body>
            </Card>

            <Card variant="elevated" hover>
              <Card.Header>
                <Card.Title>Elevated Card</Card.Title>
                <Card.Description>Card with shadow and hover effect</Card.Description>
              </Card.Header>
              <Card.Body>
                <p className="text-gray-600">
                  Hover over this card to see the lift animation.
                </p>
              </Card.Body>
            </Card>

            <Card variant="gradient">
              <Card.Header>
                <Card.Title>Gradient Card</Card.Title>
                <Card.Description>Card with gradient background</Card.Description>
              </Card.Header>
              <Card.Body>
                <p className="text-gray-600">
                  This card has a subtle gradient background.
                </p>
              </Card.Body>
            </Card>
          </div>
        </motion.section>

        {/* Badges Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Badges</Card.Title>
              <Card.Description>
                Status indicators and labels in various colors
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                {/* Badge Variants */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="gradient">Gradient</Badge>
                  </div>
                </div>

                {/* Badge Sizes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>

                {/* Badge with Icons */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">With Icons</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                      Completed
                    </Badge>
                    <Badge variant="warning" icon={<AlertCircle className="w-3 h-3" />}>
                      Warning
                    </Badge>
                    <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
                      Error
                    </Badge>
                    <Badge variant="info" icon={<Info className="w-3 h-3" />}>
                      Information
                    </Badge>
                  </div>
                </div>

                {/* Removable Badges */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Removable</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" onRemove={() => alert('Removed!')}>
                      React
                    </Badge>
                    <Badge variant="secondary" onRemove={() => alert('Removed!')}>
                      JavaScript
                    </Badge>
                    <Badge variant="success" onRemove={() => alert('Removed!')}>
                      Node.js
                    </Badge>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.section>

        {/* Inputs Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Input Fields</Card.Title>
              <Card.Description>
                Form inputs with validation and various states
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6 max-w-md">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />
                <Input
                  label="Password"
                  type="password"
                  showPasswordToggle
                  placeholder="Enter your password"
                />
                <Input
                  label="Success State"
                  type="text"
                  value="Valid input"
                  success="This looks good!"
                />
                <Input
                  label="Error State"
                  type="text"
                  value="Invalid input"
                  error="This field is required"
                />
              </div>
            </Card.Body>
          </Card>
        </motion.section>

        {/* Modal & Toast Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Modals & Toasts</Card.Title>
              <Card.Description>
                Interactive overlays and notifications
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                {/* Modal Trigger */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Modal</h4>
                  <Button onClick={() => setIsModalOpen(true)}>
                    Open Modal
                  </Button>
                </div>

                {/* Toast Triggers */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Toast Notifications</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="success" onClick={() => showToast('success')}>
                      Success Toast
                    </Button>
                    <Button variant="danger" onClick={() => showToast('error')}>
                      Error Toast
                    </Button>
                    <Button variant="outline" onClick={() => showToast('warning')}>
                      Warning Toast
                    </Button>
                    <Button variant="ghost" onClick={() => showToast('info')}>
                      Info Toast
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.section>

        {/* Skeleton Loaders Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Skeleton Loaders</Card.Title>
              <Card.Description>
                Loading states for better user experience
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Text Skeleton</h4>
                  <Skeleton count={3} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Card Skeleton</h4>
                  <Skeleton.Card />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">List Skeleton</h4>
                  <Skeleton.List count={3} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.section>

        {/* Animations Section */}
        <motion.section
          {...fadeInUp}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <Card>
            <Card.Header>
              <Card.Title>Animations</Card.Title>
              <Card.Description>
                Smooth transitions and micro-interactions
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <motion.div
                    key={item}
                    variants={staggerItem}
                    {...hoverLift}
                    className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-xl text-center cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold mb-2">Card {item}</h3>
                    <p className="text-blue-100">Hover to see animation</p>
                  </motion.div>
                ))}
              </motion.div>
            </Card.Body>
          </Card>
        </motion.section>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        description="This is a demo modal with all the features"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This modal demonstrates the modal component with a title, description,
            and custom content. It includes smooth animations and can be closed by
            clicking the X button, pressing Escape, or clicking outside.
          </p>
          <Input
            label="Your Name"
            placeholder="Enter your name"
          />
          <Input
            label="Your Email"
            type="email"
            placeholder="Enter your email"
          />
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DesignSystemDemo;
