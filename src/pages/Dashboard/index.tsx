import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data } = await api.get<IFoodPlate[]>('/foods');

      setFoods([...foods, ...data]);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const response = await api.post('/foods', {
          image: food.image,
          name: food.name,
          description: food.description,
          price: food.price,
          available: true,
        });

        setFoods([...foods, response.data]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const response = await api.put(`/foods/${editingFood.id}`, {
          image: food.image,
          name: food.name,
          description: food.description,
          price: food.price,
          available: editingFood.available,
        });

        const updatedFoods = foods.map(item => {
          if (item.id === editingFood.id) {
            return response.data;
          }

          return item;
        });

        setFoods(updatedFoods);
      } catch (err) {
        console.log(err);
      }
    },
    [foods, editingFood.id, editingFood.available],
  );

  const handleDeleteFood = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/foods/${id}`);

        const actualFoods = foods.filter(food => food.id !== id);

        setFoods(actualFoods);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback(
    (food: IFoodPlate) => {
      setEditingFood(food);

      toggleEditModal();
    },
    [toggleEditModal],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
