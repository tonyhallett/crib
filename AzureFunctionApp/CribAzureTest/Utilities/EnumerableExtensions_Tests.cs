using System.Diagnostics.CodeAnalysis;
using CribAzureFunctionApp.Utilities;

namespace CribAzureTest.Utilities
{
    internal class EnumerableExtensions_Tests
    {
        class X
        {
            [ExcludeFromCodeCoverage]
            public int Id { get; }
            private static int Count = 0;
            private X(int id)
            {
                Id = id;
            }
            public static X New()
            {
                return new X(Count++);
            }
        }

        record ItemIndex(X Item, int Index) { }

        [Test]
        public void All_Should_Work_Like_Normal_All_But_With_Additional_Index_Argument_To_PRedicate()
        {
            var items = new List<X> { X.New(), X.New() };
            var predicateItems = new List<ItemIndex>();
            var shouldBeTrue = items.All((item, index) =>
            {
                predicateItems.Add(new ItemIndex(item, index));
                return true;
            });
            Assert.Multiple((TestDelegate)(() =>
            {
                Assert.That(shouldBeTrue, Is.True);
                Assert.That<IEnumerable<X>>(predicateItems.Select<ItemIndex, X>(pi => pi.Item), Is.EquivalentTo(items));
                Assert.That<IEnumerable<int>>(predicateItems.Select<ItemIndex, int>((Func<ItemIndex, int>)(pi => (int)pi.Index)), Is.EquivalentTo(new List<int> { 0, 1 }));
            }));
            predicateItems.Clear();

            var shouldBeFalse = items.All((item, index) =>
            {
                predicateItems.Add(new ItemIndex(item, index));
                return false;
            });
            Assert.Multiple((TestDelegate)(() =>
            {
                Assert.That(shouldBeFalse, Is.False);
                Assert.That<X>(predicateItems.Select<ItemIndex, X>(pi => pi.Item).Single<X>(), Is.EqualTo(items[0]));
                Assert.That(predicateItems.Select<ItemIndex, int>((Func<ItemIndex, int>)(pi => (int)pi.Index)).Single(), Is.EqualTo(0));
            }));
        }
    }
}
